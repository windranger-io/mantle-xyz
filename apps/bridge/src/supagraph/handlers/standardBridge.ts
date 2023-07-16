/* eslint-disable no-param-reassign, no-console, no-underscore-dangle */
import { MessageDirection } from "@mantleio/sdk";

// Supagraph specific constants detailing the contracts we'll sync against
import { TransactionReceipt } from "@ethersproject/providers";
import { hashCrossDomainMessage } from "@mantleio/core-utils";

import { BigNumber } from "ethers";
import { Store } from "@mantle/supagraph";

import {
  ERC20DepositInitiated,
  ETHDepositInitiated,
  L1ToL2MessageEntity,
} from "../types";
import { claim } from "./claim";
import { getMessagesByTransaction } from "./message";

// Enum the assigned types
enum MessageType {
  ETH = 0,
  ERC20 = 1,
}

// Save each Deposit action into the db so it can be matched against a RelayedMessage event to mark status updates
// - temporarily calling out to the Production-Faucet to allow for the claiming wallets gas-drops on deposit to L2
const storeL1toL2Message = async (
  type: MessageType,
  tx: TransactionReceipt,
  args: {
    amount: BigNumber;
    l1Token?: string;
    l2Token?: string;
  }
) => {
  // wrap incase of errors
  try {
    // retrieve the messages for this transaction (but reuse the tx we have)
    const messages = await getMessagesByTransaction(tx.transactionHash, {
      // passing the tx through so that we dont have to refetch it to build the messageHash
      receipt: tx,
      // always going in this direction for L1toL2Message
      direction: MessageDirection.L1_TO_L2,
    });

    // only proceed if the message details were discovered (this should always be the case, but just make sure...)
    if (messages && messages[0]) {
      // from the point of deposit/withdrawal we have the data we need to construct the hashCrossDomainMessage for this message
      const resolved = messages[0];

      // produce the hash from the resolved message data retrieved from the tx's log data
      // - this hash will correspond with a `RelayedMessage` event on the opposite chains CrossDomainMessenger
      const messageHash = hashCrossDomainMessage(
        resolved.messageNonce,
        resolved.sender,
        resolved.target,
        resolved.value,
        resolved.minGasLimit,
        resolved.message
      );

      // add this messageHash to the db and wait for it to show up in the RelayedMessages/FailedRelayedMessages before updating status (see mesenger handlers)
      const message = await Store.get<L1ToL2MessageEntity>(
        "L1ToL2Message",
        messageHash,
        true
      );

      // default the status
      message.set("status", 0);

      // save details to restore the hash
      message.set("messageNonce", resolved.messageNonce);
      message.set("sender", resolved.sender);
      message.set("target", resolved.target);
      message.set("value", resolved.value);
      message.set("minGasLimit", resolved.minGasLimit);
      message.set("message", resolved.message);

      // set the args of the deposit
      message.set("amount", args.amount);
      message.set("l1Token", args.l1Token);
      message.set("l2Token", args.l2Token);

      // save from the transaction that made the deposit
      message.set("from", tx.from);
      message.set("l1Tx", tx.transactionHash);
      message.set("l1BlockNumber", tx.blockNumber);

      // add a gas-drop claim for this sender
      await claim(tx.from)
        .then((result: any) => {
          if (!result?.error) {
            // mark that we've sent the gas-drop
            message.set("gasDropped", true);
            // log in stdout
            // console.log(`Gas-drop created for ${result?.data?.reservedFor}`);
          }
        })
        // noop any errors
        .catch(() => ({}));

      // commit the save
      await message.save();
    }
  } catch (e) {
    console.log(e);
  }
};

// Sync ERC20Deposit events
export const ERC20DepositInitiatedHandler = async (
  args: ERC20DepositInitiated,
  { tx }: { tx: TransactionReceipt }
) => {
  // we know that this is a valid bridge action (accepted by the bridge) - add it to the db and wait for it to succeed or fail
  // console.log("deposit-erc20:", args, "tx", tx.transactionHash);

  // append the message
  await storeL1toL2Message(MessageType.ERC20, tx, {
    amount: args._amount,
    l1Token: args._l1Token,
    l2Token: args._l2Token,
  });
};

// Sync ETHDeposit events
export const ETHDepositInitiatedHandler = async (
  args: ETHDepositInitiated,
  { tx }: { tx: TransactionReceipt }
) => {
  // console.log("deposit-eth:", args, "tx", tx.transactionHash);

  // append the message
  await storeL1toL2Message(MessageType.ETH, tx, {
    amount: args._amount,
  });
};
