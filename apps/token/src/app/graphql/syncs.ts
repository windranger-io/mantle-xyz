// We create new providers here to connect to the selected rpc
import { BigNumber, providers } from "ethers";

// Use addSync to add operations and Store to interact with entity storage
import { addSync, Store } from "@mantle/supagraph";

// Supagraph specific constants detailing the contracts we'll sync against
import {
  L1_START_BLOCK,
  L1_MANTLE_TOKEN,
  LN_MANTLE_TOKEN_ABI,
  DelegateChangedEvent,
  DelegateVotesChangedEvent,
  TransferEvent,
  DelegateEntity,
  L1_CHAIN_NAME,
} from "./config";

// configure JsonRpcProvider for L1
const L1_PROVIDER = new providers.JsonRpcProvider(
  `https://${L1_CHAIN_NAME}.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`
);

// Sync DelegateChanged events
export const DelegateChangedHandler = addSync<DelegateChangedEvent>({
  // Set the name of the event we're consuming with this handler (1 event per handler)
  eventName: "DelegateChanged",
  // Connect the sync to L1 Provider and set the sync startBlock
  provider: L1_PROVIDER,
  startBlock: L1_START_BLOCK,
  // Define the event we're indexing with this handler
  address: L1_MANTLE_TOKEN,
  eventAbi: LN_MANTLE_TOKEN_ABI,
  // Construct the callback we'll use to index the event
  onEvent: async (args, { tx }) => {
    // load the entity for this batchIndex
    const entity = await Store.get<DelegateEntity>("Delegate", args.delegator);

    // console.log("add", entity.balance, "to", args.toDelegate);

    // fetch old
    const oldDelegate = await Store.get<DelegateEntity>(
      "Delegate",
      args.fromDelegate
    );

    // fetch new
    const newDelegate = await Store.get<DelegateEntity>(
      "Delegate",
      args.toDelegate
    );

    if (args.fromDelegate !== "0x0000000000000000000000000000000000000000") {
      // update the old and new delegates with the correct votes
      oldDelegate.set(
        "delegatorsCount",
        BigNumber.from(oldDelegate.delegatorsCount || "0").sub(1)
      );
    }

    newDelegate.set(
      "delegatorsCount",
      BigNumber.from(newDelegate.delegatorsCount || "0").add(1)
    );

    // set details for appended batch (id'd according to batchIndex)
    entity.set("to", args.toDelegate);

    // update pointers for lastUpdate
    entity.set("blockNumber", tx.blockNumber);
    entity.set("transactionHash", tx.transactionHash);
    newDelegate.set("blockNumber", tx.blockNumber);
    newDelegate.set("transactionHash", tx.transactionHash);

    // save the changes
    await entity.save();
    await newDelegate.save();

    // only save if its not from the 0x00 address
    if (args.fromDelegate !== "0x0000000000000000000000000000000000000000") {
      oldDelegate.set("blockNumber", tx.blockNumber);
      oldDelegate.set("transactionHash", tx.transactionHash);
      await oldDelegate.save();
    }
  },
});

// Sync DelegateVotesChanged events
export const DelegateVotesChangedHandler = addSync<DelegateVotesChangedEvent>({
  // Set the name of the event we're consuming with this handler (1 event per handler)
  eventName: "DelegateVotesChanged",
  // Connect the sync to L1 Provider and set the sync startBlock
  provider: L1_PROVIDER,
  startBlock: L1_START_BLOCK,
  // Define the event we're indexing with this handler
  address: L1_MANTLE_TOKEN,
  eventAbi: LN_MANTLE_TOKEN_ABI,
  // Construct the callback we'll use to index the event
  onEvent: async (args, { tx }) => {
    // load the entity for this batchIndex
    const entity = await Store.get<DelegateEntity>("Delegate", args.delegate);

    // console.log("votes changed", args.delegate, "from", args.previousBalance.toString(), "to", args.newBalance.toString());

    // store changes
    entity.set("votes", args.newBalance);

    // update pointers for lastUpdate
    entity.set("blockNumber", tx.blockNumber);
    entity.set("transactionHash", tx.transactionHash);

    // save the changes
    await entity.save();
  },
});

// Sync Transfer events
export const TransferHandler = addSync<TransferEvent>({
  // Set the name of the event we're consuming with this handler (1 event per handler)
  eventName: "Transfer",
  // Connect the sync to L1 Provider and set the sync startBlock
  provider: L1_PROVIDER,
  startBlock: L1_START_BLOCK,
  // Define the event we're indexing with this handler
  address: L1_MANTLE_TOKEN,
  eventAbi: LN_MANTLE_TOKEN_ABI,
  // Construct the callback we'll use to index the event
  onEvent: async (args, { tx }) => {
    // load the entity for this batchIndex
    const entity = await Store.get<DelegateEntity>("Delegate", args.from);
    const recipient = await Store.get<DelegateEntity>("Delegate", args.to);

    // update sender if its not 0x0 address
    if (args.from !== "0x0000000000000000000000000000000000000000") {
      entity.set(
        "balance",
        BigNumber.from(entity.balance || 0).sub(args.value)
      );
      entity.set("blockNumber", tx.blockNumber);
      entity.set("transactionHash", tx.transactionHash);
      await entity.save();
    }

    // update the recipient
    recipient.set(
      "balance",
      BigNumber.from(recipient.balance || 0).add(args.value)
    );
    recipient.set("blockNumber", tx.blockNumber);
    recipient.set("transactionHash", tx.transactionHash);

    // save the changes
    await recipient.save();
  },
});
