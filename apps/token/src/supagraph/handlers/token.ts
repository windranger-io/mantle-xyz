// We use BigNumber to handle all numeric operations
import { BigNumber } from "ethers";
import { getAddress } from "ethers/lib/utils";

// Use Store to interact with entity storage
import { Store } from "supagraph";

// Each event is supplied the block and tx along with the typed args
import { TransactionReceipt } from "@ethersproject/providers";

// - These types will be generated based on the event signatures exported by the defined contracts in config (coming soon TM);
import type {
  DelegateChangedEvent,
  DelegateEntity,
  DelegateVotesChangedEvent,
  TransferEvent,
} from "../types";

// Extract the Mantle token address so that we can detect which contract the event belongs to
const MANTLE_TOKEN_ADDRESS = getAddress(
  process.env.MANTLE_ADDRESS || "0xc1dC2d65A2243c22344E725677A3E3BEBD26E604"
);

// Generic handler to consume DelegateChanged events
export const DelegateChangedHandler = async (
  args: DelegateChangedEvent,
  { tx }: { tx: TransactionReceipt }
) => {
  // console.log("delegate: from", args.fromDelegate, "to", args.toDelegate);

  // construct token specific props
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

  // construct token specific props
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

  // construct token specific props
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
    const newBalance = BigNumber.from(entity[balanceProp] || "0").sub(
      args.value
    );

    // sub from the sender
    entity.set(balanceProp, newBalance);

    // sum the balances
    entity.set(
      "balance",
      newBalance.add(BigNumber.from(entity[otherBalanceProp] || "0"))
    );

    // update pointers for lastUpdate
    entity.set("blockNumber", tx.blockNumber);
    entity.set("transactionHash", tx.transactionHash);

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
