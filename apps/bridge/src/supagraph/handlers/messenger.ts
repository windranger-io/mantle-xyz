/* eslint-disable no-console */
// RelayedMessage
// FailedRelayedMessage

import { TransactionReceipt } from "@ethersproject/providers";
import { Store } from "@mantle/supagraph";
import {
  FailedRelayedMessage,
  L1ToL2MessageEntity,
  RelayedMessage,
} from "@supagraph/types";

// Sync RelayedMessage events
export const RelayedMessageHandler = async (
  args: RelayedMessage,
  { tx }: { tx: TransactionReceipt }
) => {
  // check for an entry with the given hash and attempt the claim (marking txHash)
  // console.log("Relayed Message", args.msgHash, " with tx ", tx.transactionHash);

  // retrieve the message from the store
  const message = await Store.get<L1ToL2MessageEntity>(
    "L1ToL2Message",
    args.msgHash
  );

  // mark as complete
  if (message.l1Tx) {
    message.set("status", 1);
    message.set("l2Tx", tx.transactionHash);

    await message.save();
  }
};

// Sync FailedRelayedMessage events
export const FailedRelayedMessageHandler = async (
  args: FailedRelayedMessage,
  { tx }: { tx: TransactionReceipt }
) => {
  // check for an entry with the given hash and attempt the claim (marking txHash)
  console.log(
    "Failed Relayed Message",
    args.msgHash,
    " with tx ",
    tx.transactionHash
  );

  // retrieve the message from the store
  const message = await Store.get<L1ToL2MessageEntity>(
    "L1ToL2Message",
    args.msgHash
  );

  // mark as failed
  if (message.l1Tx) {
    message.set("status", 2);
    message.set("l2Tx", tx.transactionHash);

    await message.save();
  }
};
