// We create new providers here to connect to the selected rpc
import { BigNumber, providers } from "ethers";

// Use addSync to add operations and Store to interact with entity storage
import { addSync, Store } from "@mantle/supagraph";

// Supagraph specific constants detailing the contracts we'll sync against
import {
  L1_CHAIN_NAME,
  L1_START_BLOCK,
  L1_MANTLE_TOKEN,
  LN_MANTLE_TOKEN_ABI,
  // these types will be imported from a generated directory (coming soon TM);
  DelegateChangedEvent,
  DelegateVotesChangedEvent,
  TransferEvent,
  DelegateEntity,
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
    // console.log("add", entity.balance, "to", args.toDelegate);

    // load the entity for this batchIndex
    const entity = await Store.get<DelegateEntity>("Delegate", args.delegator);

    // fetch old (this could be for the same delegate as entity)
    const oldDelegate =
      args.fromDelegate === args.delegator
        ? entity
        : await Store.get<DelegateEntity>("Delegate", args.fromDelegate);

    // fetch new (this could be for the same delegate as entity or oldDelegate)
    const newDelegate =
      // eslint-disable-next-line no-nested-ternary
      args.toDelegate === args.delegator
        ? entity
        : args.fromDelegate === args.toDelegate
        ? oldDelegate
        : await Store.get<DelegateEntity>("Delegate", args.toDelegate);

    // ignore delegations that move FROM the 0x0 address (these are previously undelegated)
    if (args.fromDelegate !== "0x0000000000000000000000000000000000000000") {
      // update the old and new delegates with the correct votes
      oldDelegate.set(
        "delegatorsCount",
        BigNumber.from(oldDelegate.delegatorsCount || "0").sub(1)
      );

      // update pointers for lastUpdate
      oldDelegate.set("blockNumber", tx.blockNumber);
      oldDelegate.set("transactionHash", tx.transactionHash);

      // save the changes
      await oldDelegate.save();
    }

    // update the counter on the delegate we're delegating to
    newDelegate.set(
      "delegatorsCount",
      BigNumber.from(newDelegate.delegatorsCount || "0").add(1)
    );

    // set the to according to the delegation
    entity.set("to", args.toDelegate);

    // update pointers for lastUpdate
    entity.set("blockNumber", tx.blockNumber);
    entity.set("transactionHash", tx.transactionHash);
    newDelegate.set("blockNumber", tx.blockNumber);
    newDelegate.set("transactionHash", tx.transactionHash);

    // save the changes
    await entity.save();
    await newDelegate.save();
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
    // console.log("votes changed:", args.delegate, "from", args.previousBalance.toString(), "to", args.newBalance.toString());

    // load the entity for this batchIndex
    const entity = await Store.get<DelegateEntity>("Delegate", args.delegate);

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
    // console.log("transfer: from", args.from, "to", args.to, "for", args.value.toString());

    // load the entity for this batchIndex
    const entity = await Store.get<DelegateEntity>("Delegate", args.from);
    const recipient = await Store.get<DelegateEntity>("Delegate", args.to);

    // update sender if its not 0x0 address
    if (args.from !== "0x0000000000000000000000000000000000000000") {
      // sub from the sender
      entity.set(
        "balance",
        BigNumber.from(entity.balance || 0).sub(args.value)
      );

      // update pointers for lastUpdate
      entity.set("blockNumber", tx.blockNumber);
      entity.set("transactionHash", tx.transactionHash);

      // save the changes
      await entity.save();
    }

    // add to the recipient
    recipient.set(
      "balance",
      BigNumber.from(recipient.balance || 0).add(args.value)
    );

    // update pointers for lastUpdate
    recipient.set("blockNumber", tx.blockNumber);
    recipient.set("transactionHash", tx.transactionHash);

    // save the changes
    await recipient.save();
  },
});
