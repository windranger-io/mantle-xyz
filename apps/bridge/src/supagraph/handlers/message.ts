/* eslint-disable no-param-reassign */
import config from "@supagraph/config";
import { L1_CHAIN_ID, L2_CHAIN_ID } from "@config/constants";

// Using ethers to parse logs
import { BigNumber } from "ethers";
import {
  Log,
  JsonRpcProvider,
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/providers";

// Using CrossChainMessenger for contract/address management
import {
  CrossChainMessenger,
  MessageDirection,
  TransactionLike,
  toTransactionHash,
} from "@ethan-bedrock/sdk";

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

// use alternative implementation of crossChainMessenger.getMessagesByTransaction so that we can pass pre-collected txReceipt
export const getMessagesByTransaction = async (
  transaction: TransactionLike,
  opts: {
    direction: MessageDirection;
    receipt?: TransactionReceipt;
  } = {
    direction: MessageDirection.L1_TO_L2,
  }
): Promise<void> => {
  // Wait for the transaction receipt if the input is waitable.
  await (transaction as TransactionResponse)?.wait?.();

  // Convert the input to a transaction hash.
  const txHash = toTransactionHash(transaction);

  // retrieve the receipt (from opts if provided, else from provider)
  let { receipt } = opts;
  if (!receipt) {
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
  }

  // no receipt - cannot proceed
  if (!receipt) {
    throw new Error(`unable to find transaction receipt for ${txHash}`);
  }

  // by this point opts.direction will always be defined.
  const messenger =
    opts.direction === MessageDirection.L1_TO_L2
      ? crossChainMessenger.contracts.l1.L1CrossDomainMessenger
      : crossChainMessenger.contracts.l2.L2CrossDomainMessenger;

  // run through the logs and find the "SentMessage" call
  receipt.logs
    .filter((log) => {
      // only look at logs emitted by the messenger address
      return log.address === messenger.address;
    })
    .filter((log) => {
      // only look at SentMessage logs specifically
      const parsed = messenger.interface.parseLog(log);
      return parsed.name === "SentMessage";
    })
    .map((log) => {
      let value = BigNumber.from(0);
      if ((receipt?.logs?.length || 0) > log.logIndex + 1) {
        const next = receipt?.logs[log.logIndex + 1] || ({} as Log);
        if (next?.address === messenger.address) {
          const nextParsed = messenger.interface.parseLog(next);
          if (nextParsed.name === "SentMessageExtension1") {
            value = nextParsed.args.value;
          }
        }
      }

      // convert each SentMessage log into a message object
      const parsed = messenger.interface.parseLog(log);
      return {
        value,
        direction: opts.direction,
        target: parsed.args.target,
        sender: parsed.args.sender,
        message: parsed.args.message,
        messageNonce: parsed.args.messageNonce,
        minGasLimit: parsed.args.gasLimit,
        logIndex: log.logIndex,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
      };
    });
};
