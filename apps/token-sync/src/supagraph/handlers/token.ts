// We use BigNumber to handle all numeric operations
import { BigNumber, Contract } from "ethers";
import { getAddress } from "ethers/lib/utils";

// Use Store to interact with entity storage
import { Entity, Store, enqueuePromise, withDefault } from "supagraph";

// Each event is supplied the block and tx along with the typed args
import {
  Block,
  JsonRpcProvider,
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/providers";

// Import config to pull provider urls
import { config } from "@supagraph/config";

// - These types will be generated based on the event signatures exported by the defined contracts in config (coming soon TM);
import type {
  DelegateEntity,
  DelegateChangedEvent,
  DelegateVotesChangedEvent,
} from "../types";

// Extract the Mantle token address so that we can detect which contract the event belongs to
const MANTLE_TOKEN_ADDRESS = getAddress(
  process.env.MANTLE_ADDRESS || "0xc1dC2d65A2243c22344E725677A3E3BEBD26E604"
);
const BITDAO_TOKEN_ADDRESS = getAddress(
  process.env.BITDAO_ADDRESS || "0xB17B140eddCC575DaD4256959b8A35d0E7E1Ae17"
);
const L2_MANTLE_TOKEN_ADDRESS = getAddress(
  process.env.L2_MANTLE_ADDRESS || "0xEd459209796D741F5B609131aBd927586fcCACC5"
);

// construct the provider once
const L2Provider = new JsonRpcProvider(
  config.providers[withDefault(process.env.L2_MANTLE_CHAIN_ID, 5001)].rpcUrl
);

// produce an ethers contract to check balances against
const mntTokenContract = new Contract(
  "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000",
  ["function balanceOf(address _owner) view returns (uint256 balance)"],
  L2Provider
);

// get the balance at the given block height
const getBalance = async (address: string, block: number) => {
  return mntTokenContract.balanceOf(address, {
    blockTag: `0x${(+block).toString(16)}`,
  });
};

// update sync pointers and save
const updatePointers = async (
  entity: Entity<DelegateEntity> & DelegateEntity,
  tx: TransactionReceipt & TransactionResponse
) => {
  // update pointers for lastUpdate
  entity.set("blockNumber", +tx.blockNumber);
  entity.set("transactionHash", tx.transactionHash || tx.hash);

  // save the changes
  return entity.save();
};

// update the details according to an l2 DelegateChangedEvent
const updateL2Delegate = async (
  args: DelegateChangedEvent & {
    newBalance: BigNumber;
  },
  { tx, block }: { tx: TransactionReceipt & TransactionResponse; block: Block }
) => {
  // load the entity for this batchIndex
  let entity = await Store.get<DelegateEntity>(
    "Delegate",
    getAddress(args.delegator)
  );

  // fetch old (this could be for the same delegate as entity)
  let oldDelegate: typeof entity;
  // fetch new (this could be for the same delegate as entity or oldDelegate)
  let newDelegate: typeof entity;

  // set block and chainId
  entity.block = block;
  entity.chainId = withDefault(process.env.L2_MANTLE_CHAIN_ID, 5001);

  // unpack the newBalance
  const newBalance = args.newBalance || "0";

  // if we're not setting a new delegation...
  if (args.fromDelegate !== "0x0000000000000000000000000000000000000000") {
    // get oldDelegate
    oldDelegate =
      oldDelegate ||
      (args.fromDelegate === args.delegator
        ? entity
        : await Store.get<DelegateEntity>(
            "Delegate",
            getAddress(args.fromDelegate)
          ));

    // set block and chainId
    oldDelegate.block = block;
    oldDelegate.chainId = withDefault(process.env.L2_MANTLE_CHAIN_ID, 5001);

    // update votes
    oldDelegate.set(
      "votes",
      BigNumber.from(oldDelegate.votes || "0").sub(
        BigNumber.from(entity.l2MntBalance || "0")
      )
    );
    oldDelegate.set(
      "l2MntVotes",
      BigNumber.from(oldDelegate.l2MntVotes || "0").sub(
        BigNumber.from(entity.l2MntBalance || "0")
      )
    );

    // save the changes to old delegate
    oldDelegate = await updatePointers(oldDelegate, tx);

    // align delegates
    if (args.fromDelegate === args.delegator) {
      entity = oldDelegate;
    }
    if (args.fromDelegate === args.toDelegate) {
      newDelegate = oldDelegate;
    }
  }

  // if we're not removing the delegation...
  if (args.toDelegate !== "0x0000000000000000000000000000000000000000") {
    // get newDelegate
    newDelegate =
      // eslint-disable-next-line no-nested-ternary
      newDelegate ||
      (args.toDelegate === args.delegator
        ? entity
        : args.fromDelegate === args.toDelegate
        ? oldDelegate
        : await Store.get<DelegateEntity>(
            "Delegate",
            getAddress(args.toDelegate)
          ));

    // set block and chainId
    newDelegate.block = block;
    newDelegate.chainId = withDefault(process.env.L2_MANTLE_CHAIN_ID, 5001);

    // set new votes...
    newDelegate.set(
      "votes",
      BigNumber.from(newDelegate.votes || "0").add(BigNumber.from(newBalance))
    );
    newDelegate.set(
      "l2MntVotes",
      BigNumber.from(newDelegate.l2MntVotes || "0").add(
        BigNumber.from(newBalance)
      )
    );

    // save the changes to new delegate
    newDelegate = await updatePointers(newDelegate, tx);

    // align delegates
    if (args.toDelegate === args.delegator) {
      entity = newDelegate;
    }
    if (args.fromDelegate === args.toDelegate) {
      oldDelegate = newDelegate;
    }
  }

  // record the new balance
  entity.set("l2MntBalance", BigNumber.from(newBalance));

  // save the changes
  entity = await updatePointers(entity, tx);
};

// retrieve balance from delegateChanged events
const getDelegateBalances = async (
  args: DelegateChangedEvent,
  { tx, block }: { tx: TransactionReceipt & TransactionResponse; block: Block }
) => {
  // load the entity for this batchIndex
  let entity = await Store.get<DelegateEntity>(
    "Delegate",
    getAddress(args.delegator)
  );

  // fetch the oldBalance (if this isnt set then we havent recorded the delegation to the oldDelegate)
  let oldBalance = entity.l2MntBalance || 0;
  let newBalance = oldBalance;

  // we have to read the balance if this is a new delegation
  if (!oldBalance) {
    // get balance at tx blockNumber
    newBalance = await getBalance(args.delegator, tx.blockNumber);
  } else {
    // get the current l2Balance for the user (we want this post gas spend after this tx)
    // *NOTE we can only apply this once - if we've already migrated the balance in this call (via migration) we should omit saving
    // this change - this is being controlled by the `withPromise` handler
    // newBalance = BigNumber.from(oldBalance)
    //   // remove the cost of the transaction
    //   .sub(BigNumber.from(tx.gasUsed).mul(tx.gasPrice))
    //   // @ts-ignore
    //   .sub(BigNumber.from(tx.l1GasUsed).mul(tx.l1GasPrice));
    // get balance at tx blockNumber
    newBalance = await getBalance(args.delegator, tx.blockNumber);
  }

  // return the action with async parts resolved
  return {
    tx,
    block,
    // set the type
    type: "DelegateChangedHandler",
    // place the balances
    newBalance: BigNumber.from(newBalance),
    // copy the args
    delegator: args.delegator,
    fromDelegate: args.fromDelegate,
    toDelegate: args.toDelegate,
    // update pointers for lastUpdate
    blockNumber: +tx.blockNumber,
    transactionHash: tx.transactionHash || tx.hash,
    transactionIndex: tx.transactionIndex,
  };
};

// Handler to consume DelegateChanged events from known contracts
export const DelegateChangedHandler = async (
  args: DelegateChangedEvent,
  { tx, block }: { tx: TransactionReceipt & TransactionResponse; block: Block }
) => {
  // console.log("delegate: from", args.fromDelegate, "to", args.toDelegate);

  // format the current contractAddress
  const contractAddress = getAddress(tx.contractAddress || tx.to);

  // make sure we're calling from an appropriate contract
  if (
    [
      MANTLE_TOKEN_ADDRESS,
      BITDAO_TOKEN_ADDRESS,
      L2_MANTLE_TOKEN_ADDRESS,
    ].indexOf(contractAddress) !== -1
  ) {
    // construct token specific props
    const toProp = `${
      contractAddress === MANTLE_TOKEN_ADDRESS
        ? "mnt"
        : contractAddress === BITDAO_TOKEN_ADDRESS
        ? "bit"
        : "l2Mnt"
    }To` as "mntTo" | "bitTo" | "l2MntTo";
    const countProp = `${
      contractAddress === MANTLE_TOKEN_ADDRESS
        ? "mnt"
        : contractAddress === BITDAO_TOKEN_ADDRESS
        ? "bit"
        : "l2Mnt"
    }DelegatorsCount` as
      | "mntDelegatorsCount"
      | "bitDelegatorsCount"
      | "l2MntDelegatorsCount";

    // load the entity for this batchIndex
    let entity = await Store.get<DelegateEntity>(
      "Delegate",
      getAddress(args.delegator)
    );

    // fetch old (this could be for the same delegate as entity)
    let oldDelegate: typeof entity;

    // fetch new (this could be for the same delegate as entity or oldDelegate)
    let newDelegate: typeof entity;

    // ignore delegations that move FROM the 0x0 address (these are previously undelegated)
    if (args.fromDelegate !== "0x0000000000000000000000000000000000000000") {
      // get if we need to grab oldDelegate
      oldDelegate =
        oldDelegate ||
        (args.fromDelegate === args.delegator
          ? entity
          : await Store.get<DelegateEntity>(
              "Delegate",
              getAddress(args.fromDelegate)
            ));
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
      oldDelegate = await updatePointers(oldDelegate, tx);

      // align delegates
      if (args.fromDelegate === args.delegator) {
        entity = oldDelegate;
      }
      if (args.fromDelegate === args.toDelegate) {
        newDelegate = oldDelegate;
      }
    }

    // when not delegating to the 0x0 address, update counters (we don't care for the voting weight of 0x0)
    if (args.toDelegate !== "0x0000000000000000000000000000000000000000") {
      newDelegate =
        // eslint-disable-next-line no-nested-ternary
        newDelegate ||
        (args.toDelegate === args.delegator
          ? entity
          : args.fromDelegate === args.toDelegate
          ? oldDelegate
          : await Store.get<DelegateEntity>(
              "Delegate",
              getAddress(args.toDelegate)
            ));
      // update the counter on the delegate we're delegating to
      newDelegate.set(
        "delegatorsCount",
        BigNumber.from(newDelegate.delegatorsCount || "0").add(1)
      );
      newDelegate.set(
        countProp,
        BigNumber.from(newDelegate[countProp] || "0").add(1)
      );

      // update pointers for lastUpdate
      newDelegate = await updatePointers(newDelegate, tx);

      // align delegates
      if (args.toDelegate === args.delegator) {
        entity = newDelegate;
      }
      if (args.fromDelegate === args.toDelegate) {
        oldDelegate = newDelegate;
      }
    }

    // set the to according to the delegation
    entity.set(toProp, args.toDelegate);

    // update pointers for lastUpdate
    await updatePointers(entity, tx);

    // on L2 we don't have a DelegateVotesChangedHandler, so we should apply changes now against this event
    if (contractAddress === L2_MANTLE_TOKEN_ADDRESS) {
      // inline all of these - the order isnt important
      // if a promise fn rejects it will be reattempted - this is the safest way to handle async actions
      enqueuePromise(() => getDelegateBalances(args, { tx, block }));
    }
  }
};

// after enqueueing to process async pieces - process the items in order
export const DelegateChangedHandlerPostProcessing = async (
  item: DelegateChangedEvent & {
    newBalance: BigNumber;
    tx: TransactionReceipt & TransactionResponse;
    block: Block;
  }
) => {
  // process these sequentially
  await updateL2Delegate(
    item,
    // pass the transaction through
    { tx: item.tx, block: item.block }
  );
};

// Handler to consume DelegateVotesChanged events from known contracts
export const DelegateVotesChangedHandler = async (
  args: DelegateVotesChangedEvent,
  { tx }: { tx: TransactionReceipt & TransactionResponse }
) => {
  // console.log("votes changed:", args.delegate, "from", args.previousBalance.toString(), "to", args.newBalance.toString());

  // format the current contractAddress
  const contractAddress = getAddress(tx.contractAddress || tx.to);

  // make sure we're calling from an appropriate contract
  if (
    [MANTLE_TOKEN_ADDRESS, BITDAO_TOKEN_ADDRESS].indexOf(contractAddress) !==
      -1 &&
    args.delegate !== "0x0000000000000000000000000000000000000000"
  ) {
    // construct token specific props
    const votesProp = `${
      contractAddress === MANTLE_TOKEN_ADDRESS ? "mnt" : "bit"
    }Votes` as "mntVotes" | "bitVotes";
    const otherVotesProps = ["mntVotes", "bitVotes", "l2MntVotes"].filter(
      (val) => val !== votesProp
    );

    // load the entity for this batchIndex
    const entity = await Store.get<DelegateEntity>(
      "Delegate",
      getAddress(args.delegate)
    );

    // store changes
    entity.set(votesProp, BigNumber.from(args.newBalance || "0"));

    // votes is always a sum of both
    entity.set(
      "votes",
      BigNumber.from(args.newBalance || "0").add(
        otherVotesProps.reduce((sum, otherVotesProp) => {
          return sum.add(BigNumber.from(entity[otherVotesProp] || "0"));
        }, BigNumber.from("0"))
      )
    );

    // update pointers for lastUpdate
    await updatePointers(entity, tx);
  }
};
