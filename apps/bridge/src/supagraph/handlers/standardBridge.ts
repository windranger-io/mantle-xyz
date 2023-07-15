/* eslint-disable no-param-reassign, no-console, no-underscore-dangle */
import {
  CrossChainMessage,
  CrossChainMessenger,
  MessageDirection,
  TransactionLike,
  toTransactionHash,
} from "@mantleio/sdk";

// Supagraph specific constants detailing the contracts we'll sync against
import config from "@supagraph/config";
import { L1_CHAIN_ID, L2_CHAIN_ID } from "@config/constants";
import {
  JsonRpcProvider,
  Log,
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/providers";
import { hashCrossDomainMessage } from "@mantleio/core-utils";

import { BigNumber, ethers } from "ethers";
import { Store } from "@mantle/supagraph";

import {
  ERC20DepositInitiated,
  ETHDepositInitiated,
  L1ToL2MessageEntity,
} from "../types";
import { claim } from "./claim";

// Construct providers to supply the CrossChainMessenger
const L1_PROVIDER = new JsonRpcProvider(
  config.providers[L1_CHAIN_ID as keyof typeof config.providers].rpcUrl
);

const L2_PROVIDER = new JsonRpcProvider(
  config.providers[L2_CHAIN_ID as keyof typeof config.providers].rpcUrl
);

// Construct a messenger to create the messageHash associated with the tx and store it into the db
const crossChainMessenger = new CrossChainMessenger({
  l1ChainId: L1_CHAIN_ID,
  l2ChainId: L2_CHAIN_ID,
  l1SignerOrProvider: L1_PROVIDER,
  l2SignerOrProvider: L2_PROVIDER,
});

enum MessageType {
  ETH = 0,
  ERC20 = 1,
}

// use alternative implementation of crossChainMessenger.getMessagesByTransaction so that we can pass pre-collected txReceipt
const getMessagesByTransaction = async (
  transaction: TransactionLike,
  opts: {
    direction: MessageDirection;
    receipt?: TransactionReceipt;
  } = {
    direction: MessageDirection.L1_TO_L2,
  }
): Promise<CrossChainMessage[]> => {
  // Wait for the transaction receipt if the input is waitable.
  await (transaction as TransactionResponse).wait?.();

  // Convert the input to a transaction hash.
  const txHash = toTransactionHash(transaction);

  // retrieve the receipt (from opts if provided, else from provider)
  let { receipt } = opts;
  if (opts.direction !== undefined) {
    // Get the receipt for the requested direction.
    if (opts.direction === MessageDirection.L1_TO_L2) {
      receipt = await crossChainMessenger.l1Provider.getTransactionReceipt(
        txHash
      );
    } else {
      receipt = await crossChainMessenger.l2Provider.getTransactionReceipt(
        txHash
      );
    }
  } else {
    // Try both directions, starting with L1 => L2.
    receipt = await crossChainMessenger.l1Provider.getTransactionReceipt(
      txHash
    );
    if (receipt) {
      opts.direction = MessageDirection.L1_TO_L2;
    } else {
      receipt = await crossChainMessenger.l2Provider.getTransactionReceipt(
        txHash
      );
      opts.direction = MessageDirection.L2_TO_L1;
    }
  }

  // no receipt - cannot proceed
  if (!receipt) {
    throw new Error(`unable to find transaction receipt for ${txHash}`);
  }

  // By this point opts.direction will always be defined.
  const messenger =
    opts.direction === MessageDirection.L1_TO_L2
      ? crossChainMessenger.contracts.l1.L1CrossDomainMessenger
      : crossChainMessenger.contracts.l2.L2CrossDomainMessenger;

  return receipt.logs
    .filter((log) => {
      // Only look at logs emitted by the messenger address
      return log.address === messenger.address;
    })
    .filter((log) => {
      // Only look at SentMessage logs specifically
      const parsed = messenger.interface.parseLog(log);
      return parsed.name === "SentMessage";
    })
    .map((log) => {
      let value = ethers.BigNumber.from(0);
      if ((receipt?.logs?.length || 0) > log.logIndex + 1) {
        const next = receipt?.logs[log.logIndex + 1] || ({} as Log);
        if (next?.address === messenger.address) {
          const nextParsed = messenger.interface.parseLog(next);
          if (nextParsed.name === "SentMessageExtension1") {
            value = nextParsed.args.value;
          }
        }
      }

      // Convert each SentMessage log into a message object
      const parsed = messenger.interface.parseLog(log);
      return {
        direction: opts.direction,
        target: parsed.args.target,
        sender: parsed.args.sender,
        message: parsed.args.message,
        messageNonce: parsed.args.messageNonce,
        value,
        minGasLimit: parsed.args.gasLimit,
        logIndex: log.logIndex,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
      };
    });
};

// Save each *Deposit action into the db so it can be matched against a relayedMessage (and paid out) - we might be able to stop here.
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
      receipt: tx,
      // always going in this direction for L1toL2Message
      direction: MessageDirection.L1_TO_L2,
    });

    // from the initiation we can rebuild the messageHash and add it to the db ready to be checked and marked complete when we find it in the stateRoot's messageHashes
    const resolved = messages[0];

    // we produce a hash of the message which we can use to search the logs
    const messageHash = hashCrossDomainMessage(
      resolved.messageNonce,
      resolved.sender,
      resolved.target,
      resolved.value,
      resolved.minGasLimit,
      resolved.message
    );

    // add this messageHash to the db and wait for it to show up in the RelayedMessages/FailedRelayedMessages before adding a claim
    const message = await Store.get<L1ToL2MessageEntity>(
      "L1ToL2Message",
      messageHash
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

    // add an airdrop claim for this sender
    await (
      await claim(tx.from)
    )
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
