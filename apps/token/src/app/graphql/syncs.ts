// We create new providers here to connect to the selected rpc
import { BigNumber, providers } from "ethers";

// Use addSync to add operations and Store to interact with entity storage
import { addSync, Store } from "@mantle/supagraph";

// Supagraph specific constants detailing the contracts we'll sync against
import { TransactionReceipt } from "@ethersproject/providers";
import {
  supagraph,
  // these types will be imported from a generated directory based on the SUPAGRAPH_EVENT_SIGNATURES and SUPAGRAPH_SCHEMA (coming soon TM);
  DelegateChangedEvent,
  DelegateVotesChangedEvent,
  TransferEvent,
  DelegateEntity,
} from "./config";

// configure JsonRpcProvider for Mantle contracts chainId
const MANTLE_PROVIDER = new providers.JsonRpcProvider(
  (supagraph.providers as Record<number, { rpcUrl: string }>)[
    supagraph.contracts.mantle.chainId
  ].rpcUrl
);

// extract env config
const MANTLE_TOKEN_ADDRESS = supagraph.contracts.mantle.address;
const MANTLE_START_BLOCK = supagraph.contracts.mantle.startBlock;

// configure JsonRpcProvider for BitDAO contracts chainId
const BITDAO_PROVIDER = new providers.JsonRpcProvider(
  (supagraph.providers as Record<number, { rpcUrl: string }>)[
    supagraph.contracts.bitdao.chainId
  ].rpcUrl
);

// extract env config
const BITDAO_TOKEN_ADDRESS = supagraph.contracts.bitdao.address;
const BITDAO_START_BLOCK = supagraph.contracts.bitdao.startBlock;

// we could import the Contract from ./generated:

// -- contract handlers to call every "sync()"
// import { DelegateEntity } from "./generated/entities";
// import { DelegateChanged, Factory } from "./generated/contracts/mantle";
//
// -- set and export the handler (we could just set the type `args: DelegateChangedEvent` and return the handler directly)
// export const DelegateChangedHandler = DelegateChanged(
//   async (args, { tx, block }) => {
//     const entity = await DelegateEntity.get(args.delegator);
//
//     // if we needed to sync a factory deployed contract, we could do that by registering a new mapping for the given address
//     // await Factory.create(address); // this will start syncing from the current block (we will need to suspend, collect and sync events for the new contract)
//   }
// );
//
// -- generic handler to call every "sync()"
// import { On } from "./generated";
//
// -- set and export generic handler
// export const onSync = On("sync", ({ txs, block }) => {
//
// });

// Generic handler to consume DelegateChanged events
export const DelegateChangedHandler = async (
  args: DelegateChangedEvent,
  { tx }: { tx: TransactionReceipt }
) => {
  // console.log("add", args.fromDelegate, "to", args.toDelegate);
  const toProp = `${
    tx.contractAddress === MANTLE_TOKEN_ADDRESS ? "mnt" : "bit"
  }To` as "mntTo" | "bitTo";

  const countProp = `${
    tx.contractAddress === MANTLE_TOKEN_ADDRESS ? "mnt" : "bit"
  }DelegatorsCount` as "mntDelegatorsCount" | "bitDelegatorsCount";

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
    oldDelegate.set(
      countProp,
      BigNumber.from(oldDelegate[countProp] || "0").sub(1)
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
  newDelegate.set(
    countProp,
    BigNumber.from(newDelegate[countProp] || "0").add(1)
  );

  // set the to according to the delegation
  entity.set(toProp, args.toDelegate);

  // update pointers for lastUpdate
  entity.set("blockNumber", tx.blockNumber);
  entity.set("transactionHash", tx.transactionHash);
  newDelegate.set("blockNumber", tx.blockNumber);
  newDelegate.set("transactionHash", tx.transactionHash);

  // save the changes
  await entity.save();
  await newDelegate.save();
};

// Generic handler to consume DelegateVotesChanged events
export const DelegateVotesChangedHandler = async (
  args: DelegateVotesChangedEvent,
  { tx }: { tx: TransactionReceipt }
) => {
  // console.log("votes changed:", args.delegate, "from", args.previousBalance.toString(), "to", args.newBalance.toString());

  const votesProp = `${
    tx.contractAddress === MANTLE_TOKEN_ADDRESS ? "mnt" : "bit"
  }Votes` as "mntVotes" | "bitVotes";
  const otherVotesProp = `${
    tx.contractAddress === MANTLE_TOKEN_ADDRESS ? "bit" : "mnt"
  }Votes` as "mntVotes" | "bitVotes";

  // load the entity for this batchIndex
  const entity = await Store.get<DelegateEntity>("Delegate", args.delegate);

  // store changes
  entity.set(votesProp, args.newBalance);

  // votes is always a sum of both
  entity.set(
    "votes",
    BigNumber.from(args.newBalance || "0").add(
      BigNumber.from(entity[otherVotesProp] || "0")
    )
  );

  // update pointers for lastUpdate
  entity.set("blockNumber", tx.blockNumber);
  entity.set("transactionHash", tx.transactionHash);

  // save the changes
  await entity.save();
};

// Generic handler to consume Transfer events
export const TransferHandler = async (
  args: TransferEvent,
  { tx }: { tx: TransactionReceipt }
) => {
  // console.log("transfer: from", args.from, "to", args.to, "for", args.value.toString());
  const balanceProp = `${
    tx.contractAddress === MANTLE_TOKEN_ADDRESS ? "mnt" : "bit"
  }Balance` as "mntBalance" | "bitBalance";
  const otherBalanceProp = `${
    tx.contractAddress === MANTLE_TOKEN_ADDRESS ? "bit" : "mnt"
  }Balance` as "mntBalance" | "bitBalance";

  // load the entity for this batchIndex
  const entity = await Store.get<DelegateEntity>("Delegate", args.from);
  const recipient = await Store.get<DelegateEntity>("Delegate", args.to);

  // update sender if its not 0x0 address
  if (args.from !== "0x0000000000000000000000000000000000000000") {
    // get new balance for sender
    const newBalance = BigNumber.from(entity.balance || "0").sub(args.value);

    // sub from the sender
    entity.set(balanceProp, newBalance);

    // update pointers for lastUpdate
    entity.set("blockNumber", tx.blockNumber);
    entity.set("transactionHash", tx.transactionHash);

    // sum the balances
    entity.set(
      "balance",
      newBalance.add(BigNumber.from(entity[otherBalanceProp] || "0"))
    );

    // save the changes
    await entity.save();
  }

  // add the transfer to the balance
  const newBalance = BigNumber.from(recipient[balanceProp] || "0").add(
    args.value
  );

  // add to the recipient
  recipient.set(balanceProp, newBalance);

  // sum the balances
  recipient.set(
    "balance",
    newBalance.add(BigNumber.from(recipient[otherBalanceProp] || "0"))
  );

  // update pointers for lastUpdate
  recipient.set("blockNumber", tx.blockNumber);
  recipient.set("transactionHash", tx.transactionHash);

  // save the changes
  await recipient.save();
};

// Sync DelegateChanged events
addSync<DelegateChangedEvent>({
  // Set the name of the event we're consuming with this handler (1 event per handler)
  eventName: "DelegateChanged",
  // Connect the sync to L1 Provider and set the sync startBlock
  provider: MANTLE_PROVIDER,
  address: MANTLE_TOKEN_ADDRESS,
  startBlock: MANTLE_START_BLOCK,
  // this can be the same for all events in the supagraph
  eventAbi: supagraph.events,
  // Construct the callback we'll use to index the event
  onEvent: DelegateChangedHandler,
});

// Sync DelegateChanged events
addSync<DelegateChangedEvent>({
  // Set the name of the event we're consuming with this handler (1 event per handler)
  eventName: "DelegateChanged",
  // Connect the sync to L1 Provider and set the sync startBlock
  provider: BITDAO_PROVIDER,
  address: BITDAO_TOKEN_ADDRESS,
  startBlock: BITDAO_START_BLOCK,
  // this can be the same for all events in the supagraph
  eventAbi: supagraph.events,
  // Construct the callback we'll use to index the event
  onEvent: DelegateChangedHandler,
});

// Sync DelegateVotesChanged events
addSync<DelegateVotesChangedEvent>({
  // Set the name of the event we're consuming with this handler (1 event per handler)
  eventName: "DelegateVotesChanged",
  // Connect the sync to L1 Provider and set the sync startBlock
  provider: MANTLE_PROVIDER,
  address: MANTLE_TOKEN_ADDRESS,
  startBlock: MANTLE_START_BLOCK,
  // this can be the same for all events in the supagraph
  eventAbi: supagraph.events,
  // Construct the callback we'll use to index the event
  onEvent: DelegateVotesChangedHandler,
});

// Sync DelegateVotesChanged events
addSync<DelegateVotesChangedEvent>({
  // Set the name of the event we're consuming with this handler (1 event per handler)
  eventName: "DelegateVotesChanged",
  // Connect the sync to L1 Provider and set the sync startBlock
  provider: BITDAO_PROVIDER,
  address: BITDAO_TOKEN_ADDRESS,
  startBlock: BITDAO_START_BLOCK,
  // this can be the same for all events in the supagraph
  eventAbi: supagraph.events,
  // Construct the callback we'll use to index the event
  onEvent: DelegateVotesChangedHandler,
});

// Sync Transfer events
addSync<TransferEvent>({
  // Set the name of the event we're consuming with this handler (1 event per handler)
  eventName: "Transfer",
  // Connect the sync to L1 Provider and set the sync startBlock
  provider: MANTLE_PROVIDER,
  address: MANTLE_TOKEN_ADDRESS,
  startBlock: MANTLE_START_BLOCK,
  // this can be the same for all events in the supagraph
  eventAbi: supagraph.events,
  // Construct the callback we'll use to index the event
  onEvent: TransferHandler,
});

// Sync Transfer events
addSync<TransferEvent>({
  // Set the name of the event we're consuming with this handler (1 event per handler)
  eventName: "Transfer",
  // Connect the sync to L1 Provider and set the sync startBlock
  provider: BITDAO_PROVIDER,
  address: BITDAO_TOKEN_ADDRESS,
  startBlock: BITDAO_START_BLOCK,
  // this can be the same for all events in the supagraph
  eventAbi: supagraph.events,
  // Construct the callback we'll use to index the event
  onEvent: TransferHandler,
});
