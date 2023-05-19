/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */

"use client";

import * as React from "react";

import {
  CrossChainMessenger,
  MessageDirection,
  MessageStatus,
  MessageReceipt,
  MessageReceiptStatus,
  MessageLike,
  StateRoot,
  TransactionLike,
  toTransactionHash,
  CrossChainMessage,
} from "@mantleio/sdk";

import { hashCrossDomainMessage } from "@mantleio/core-utils";

import EthDater from "ethereum-block-by-date";
import { ethers } from "ethers";

import { goerli } from "wagmi/chains";
import { MANTLE_TESTNET_CHAIN } from "@config/constants";

import { useSigner, useProvider, useNetwork } from "wagmi";
import type {
  FallbackProvider,
  Provider,
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/providers";

import { withErrorBoundary, useErrorHandler } from "react-error-boundary";
import ErrorFallback from "@components/ErrorFallback";

const GOERLI_CHAIN_ID = goerli.id;
const MANTLE_CHAIN_ID = MANTLE_TESTNET_CHAIN.id;

type WaitForMessageStatus = (
  message: MessageLike,
  status: MessageStatus,
  opts?: {
    pollIntervalMs?: number;
    timeoutMs?: number;
  }
) => Promise<MessageReceipt>;
type GetMessageStatus = (
  message: MessageLike,
  options?: {
    returnReceipt: boolean;
  }
) => Promise<
  MessageStatus | { status: MessageStatus; receipt: MessageReceipt }
>;

type SDKContext = {
  crossChainMessenger: CrossChainMessenger;
  waitForMessageStatus: WaitForMessageStatus;
  getMessageStatus: GetMessageStatus;
};

const MantleSDKContext = React.createContext<
  | {
      crossChainMessenger: CrossChainMessenger | undefined;
      waitForMessageStatus: WaitForMessageStatus | undefined;
      getMessageStatus: GetMessageStatus | undefined;
    }
  | undefined
>(undefined);

interface MantleSDKProviderProps {
  children: React.ReactNode;
}

// returns a promise that resolves after "ms" milliseconds
const timeout = (ms: number) =>
  new Promise((res) => {
    setTimeout(res, ms);
  });

function MantleSDKProvider({ children }: MantleSDKProviderProps) {
  // currently selected chain according to wagmi (associated with provider/signer combo)
  const { chain } = useNetwork();

  // setting providers against refs because we freeze state in a render frame and need to step out
  // of that frame by ref to avoid an "underlying network changed" error if the user switches chain
  const goerliProviderRef = React.useRef<Provider>();
  const mantleTestnetRef = React.useRef<Provider>();
  const goerliInfuraRef = React.useRef<Provider>();

  // get an infura backed provider so we can search through more blocks
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const goerliInfuraProvider = new ethers.providers.InfuraProvider(
    "goerli",
    // eslint-disable-next-line @typescript-eslint/dot-notation
    process.env["NEXT_PUBLIC_INFURA_API_KEY"]
  );

  // pull all the signers/privders and set handlers and associate boundaries as we go
  const { data: goerliSigner, error: goerliSignerError } = useSigner({
    chainId: GOERLI_CHAIN_ID,
  });
  useErrorHandler(goerliSignerError);
  const goerliProvider = useProvider({
    chainId: GOERLI_CHAIN_ID,
  });
  const { data: mantleTestnetSigner, error: mantleTestnetSignerError } =
    useSigner({
      chainId: MANTLE_CHAIN_ID,
    });
  useErrorHandler(mantleTestnetSignerError);
  const mantleTestnetProvider = useProvider({
    chainId: MANTLE_CHAIN_ID,
  });

  // construct a crossChainMessenger - this is responsible for nearly all of our web3 interactions
  const crossChainMessenger = React.useMemo(() => {
    if (
      goerliSigner === undefined ||
      goerliSigner === null ||
      mantleTestnetSigner === undefined ||
      mantleTestnetSigner === null ||
      !goerliProvider ||
      !mantleTestnetProvider
    )
      return { crossChainMessenger: undefined };

    // context only stores the manager
    const context = {
      crossChainMessenger: new CrossChainMessenger({
        l1ChainId: GOERLI_CHAIN_ID,
        l2ChainId: MANTLE_CHAIN_ID,
        l1SignerOrProvider:
          chain?.id === GOERLI_CHAIN_ID ? goerliSigner : goerliProvider,
        l2SignerOrProvider:
          chain?.id === MANTLE_CHAIN_ID
            ? mantleTestnetSigner
            : // RE: https://github.com/ethers-io/ethers.js/discussions/2703
              (mantleTestnetProvider as FallbackProvider).providerConfigs[0]
                .provider,
      }),
    };

    // find corresponding blocks from opposite chain
    const dater = new EthDater(goerliProvider);

    /*
     * These crossChainMessenger functions have problems pulling logs from the rpc in the CrossChainMessenger instance,
     * we can fix it by adding in a block range to the queryFilters *Note that we're using 2000 as the queryFromBlocksBefore limit,
     * this is the maximum we can use in the L1 env, but we can query un-constrained on l2
     *
     * @TODO - Refactor to this to extend the crossChainMessenger class with these overrides
     */

    // allow messageStatus to optionally return the receipt aswell as the status
    const getMessageStatus = async (
      message: MessageLike,
      options?: {
        returnReceipt: boolean;
      }
    ): Promise<
      MessageStatus | { status: MessageStatus; receipt: MessageReceipt }
    > => {
      // starts as unconfirmed
      let status: MessageStatus = 0;

      // convert message to message hash
      const resolved = await context.crossChainMessenger.toCrossChainMessage(
        message
      );
      // attempt to fetch the messages receipt
      const receipt = await context.crossChainMessenger.getMessageReceipt(
        resolved
      );

      // match the status according to state...
      if (resolved.direction === MessageDirection.L1_TO_L2) {
        if (receipt === null) {
          status = MessageStatus.UNCONFIRMED_L1_TO_L2_MESSAGE;
        } else {
          if (
            receipt.receiptStatus === MessageReceiptStatus.RELAYED_SUCCEEDED &&
            receipt.transactionReceipt.transactionHash
          ) {
            status = MessageStatus.RELAYED;
          }
          status = status || MessageStatus.FAILED_L1_TO_L2_MESSAGE;
        }
      } else if (receipt === null) {
        // no receipt - check if the message was published
        const stateRoot = await context.crossChainMessenger.getMessageStateRoot(
          resolved
        );
        // no published
        if (stateRoot === null) {
          status = MessageStatus.STATE_ROOT_NOT_PUBLISHED;
        } else {
          // published - find out in which block
          const bn = stateRoot.batch.blockNumber;
          const block = await goerliProviderRef.current!.getBlock(bn);
          const { timestamp } = block;
          const challengePeriod =
            await context.crossChainMessenger.getChallengePeriodSeconds();
          const latestBlock = await goerliProviderRef.current!.getBlock(
            "latest"
          );
          // check that the challengePeriod period has ellapsed before marking as ready
          if (timestamp + challengePeriod > latestBlock.timestamp) {
            status = MessageStatus.IN_CHALLENGE_PERIOD;
          } else {
            status = MessageStatus.READY_FOR_RELAY;
          }
        }
      } else if (
        // we have the receipt ... and it is goood
        receipt.receiptStatus === MessageReceiptStatus.RELAYED_SUCCEEDED
      ) {
        status = MessageStatus.RELAYED;
      } else {
        status = MessageStatus.READY_FOR_RELAY;
      }

      // if returnReceipt is set then return an obj else just the status
      return options?.returnReceipt
        ? {
            status,
            receipt,
          }
        : status;
    };

    // wait for a messageStatus to update and return the associated receipt
    const waitForMessageStatus = async (
      message: MessageLike,
      status: MessageStatus,
      opts: {
        pollIntervalMs?: number;
        timeoutMs?: number;
      } = {}
    ): Promise<MessageReceipt> => {
      // Resolving once up-front is slightly more efficient.
      const resolved = await context.crossChainMessenger.toCrossChainMessage(
        message
      );

      let totalTimeMs = 0;
      while (totalTimeMs < (opts.timeoutMs || Infinity)) {
        const tick = Date.now();
        const { status: currentStatus, receipt } = (await getMessageStatus(
          resolved,
          {
            returnReceipt: true,
          }
        )) as unknown as {
          status: MessageStatus;
          receipt: MessageReceipt;
        };

        // Handle special cases for L1 to L2 messages.
        if (resolved.direction === MessageDirection.L1_TO_L2) {
          // If we're at the expected status, we're done.
          if (currentStatus === status) {
            return receipt;
          }

          if (
            status === MessageStatus.UNCONFIRMED_L1_TO_L2_MESSAGE &&
            currentStatus > status
          ) {
            // Anything other than UNCONFIRMED_L1_TO_L2_MESSAGE implies that the message was at one
            // point "unconfirmed", so we can stop waiting.
            return receipt;
          }

          if (
            status === MessageStatus.FAILED_L1_TO_L2_MESSAGE &&
            currentStatus === MessageStatus.RELAYED
          ) {
            throw new Error(
              `incompatible message status, expected FAILED_L1_TO_L2_MESSAGE got RELAYED`
            );
          }

          if (
            status === MessageStatus.RELAYED &&
            currentStatus === MessageStatus.FAILED_L1_TO_L2_MESSAGE
          ) {
            throw new Error(
              `incompatible message status, expected RELAYED got FAILED_L1_TO_L2_MESSAGE`
            );
          }
        }

        // Handle special cases for L2 to L1 messages.
        if (resolved.direction === MessageDirection.L2_TO_L1) {
          if (currentStatus >= status) {
            // For L2 to L1 messages, anything after the expected status implies the previous status,
            // so we can safely return if the current status enum is larger than the expected one.
            return receipt;
          }
        }

        await timeout(opts.pollIntervalMs || 4000);
        totalTimeMs += Date.now() - tick;
      }

      throw new Error(`timed out waiting for message status change`);
    };

    // read the challengePeriodSeconds from the contract
    context.crossChainMessenger.getChallengePeriodSeconds =
      async (): Promise<number> => {
        const contract =
          context.crossChainMessenger.contracts.l1.StateCommitmentChain.connect(
            goerliProviderRef.current!
          );

        const challengePeriod = await contract.FRAUD_PROOF_WINDOW();
        return challengePeriod.toNumber();
      };

    // get the stateRoot for a given message
    context.crossChainMessenger.getMessageStateRoot = async (
      message: MessageLike
    ): Promise<StateRoot | null> => {
      const resolved = await context.crossChainMessenger.toCrossChainMessage(
        message
      );

      // State roots are only a thing for L2 to L1 messages.
      if (resolved.direction === MessageDirection.L1_TO_L2) {
        throw new Error(`cannot get a state root for an L1 to L2 message`);
      }

      // We need the block number of the transaction that triggered the message so we can look up the
      // state root batch that corresponds to that block number.
      const messageTxReceipt =
        await mantleTestnetRef.current!.getTransactionReceipt(
          resolved.transactionHash
        );

      // Every block has exactly one transaction in it. Since there's a genesis block, the
      // transaction index will always be one less than the block number.
      const messageTxIndex = messageTxReceipt.blockNumber - 1;

      // Pull down the state root batch, we'll try to pick out the specific state root that
      // corresponds to our message.
      const stateRootBatch =
        await context.crossChainMessenger.getStateRootBatchByTransactionIndex(
          messageTxIndex
        );

      // No state root batch, no state root.
      if (stateRootBatch === null) {
        return null;
      }

      // We have a state root batch, now we need to find the specific state root for our transaction.
      // First we need to figure out the index of the state root within the batch we found. This is
      // going to be the original transaction index offset by the total number of previous state
      // roots.
      const indexInBatch =
        messageTxIndex - stateRootBatch.header.prevTotalElements.toNumber();

      // Just a sanity check.
      if (stateRootBatch.stateRoots.length <= indexInBatch) {
        // Should never happen!
        throw new Error(`state root does not exist in batch`);
      }

      return {
        stateRoot: stateRootBatch.stateRoots[indexInBatch],
        stateRootIndexInBatch: indexInBatch,
        batch: stateRootBatch,
      };
    };

    // get the message status using the read-only goerliProvider (so we can carry on checking statuses after switching network)
    context.crossChainMessenger.getMessageStatus = async (
      message: TransactionResponse
    ): Promise<MessageStatus> => {
      return (await getMessageStatus(message)) as MessageStatus;
    };

    // find the relayed messageReceipt
    context.crossChainMessenger.getMessageReceipt = async (
      message: TransactionResponse
    ): Promise<MessageReceipt> => {
      const resolved = await context.crossChainMessenger.toCrossChainMessage(
        message
      );

      // memoise the IS_L1_TO_L2 check, we'll do this a few times to make sure we're pulling data from the correct contract/network
      const IS_L1_TO_L2 = resolved.direction === MessageDirection.L1_TO_L2;

      // the message should have a blockNumber in it
      const msgBlockNumber = message.blockNumber;

      // we produce a hash of the message which we can use to search the logs
      const messageHash = hashCrossDomainMessage(
        resolved.messageNonce,
        resolved.sender,
        resolved.target,
        resolved.value,
        resolved.minGasLimit,
        resolved.message
      );

      // select the correct network/contract
      const unconnectedMessenger = IS_L1_TO_L2
        ? context.crossChainMessenger.contracts.l2.L2CrossDomainMessenger
        : context.crossChainMessenger.contracts.l1.L1CrossDomainMessenger;

      // connect to the fixed provider
      const messenger = unconnectedMessenger.connect(
        IS_L1_TO_L2 ? mantleTestnetRef.current! : goerliProviderRef.current!
      );

      // these are permitable states in L1_TO_L2 direction
      let fromBlock: number | undefined;
      let toBlock: number | string = "latest";

      // when in L2_TO_L1 we have to find appropriate blocks to constrain our query by...
      if (!IS_L1_TO_L2) {
        // select an appropriate provider to get the latest block from for the next call
        const queryBlockProvider = msgBlockNumber
          ? mantleTestnetRef.current!
          : goerliProviderRef.current!;

        // if blockNumber is provided we can use this to constrain the queryFilter on the L2 chain then find the corresponding block on the L1 chain by block.timestamp
        const queryBlock = await queryBlockProvider.getBlock(
          msgBlockNumber || "latest"
        );

        // we need to find the L1 block, if we dont have a msgBlockNumber we can just use the L1 latest block, otherwise we need to find the corresponding block
        const l1Block =
          // this gets the block nearest to the given from the opposite chain
          (msgBlockNumber &&
            (await Promise.resolve(dater.getDate(queryBlock.timestamp * 1000)))
              ?.block) ||
          // without a msgBlockNumber use the latest block from l1Provider
          queryBlock.number;

        // we have a 2000 block-range constraint when using queryFilter on L1
        // we're using the provided latest block - 2000 or the l1-version-of-msgBlockNumber +/- 1000
        fromBlock = l1Block - (!msgBlockNumber ? 2000 : 1000);
        // the toBlock is either the latestBlock or l1-version-of-msgBlockNumber +/- 1000
        toBlock = !msgBlockNumber ? "latest" : l1Block + 1000;
      }
      // look for successfully relayed messages
      const relayedMessageEvents = await messenger
        .queryFilter(
          messenger.filters.RelayedMessage(messageHash),
          fromBlock,
          toBlock
        )
        .catch(() => []);
      // if the relay was successful only once then return the receipt
      if (relayedMessageEvents.length === 1) {
        return {
          receiptStatus: MessageReceiptStatus.RELAYED_SUCCEEDED,
          transactionReceipt:
            await relayedMessageEvents[0].getTransactionReceipt(),
        };
      }
      // otherwise we have a bad state...[]
      if (relayedMessageEvents.length > 1) {
        throw new Error(`multiple successful relays for message`);
      }

      // if we didn't find any events then look for errors (using the same block constraints)
      const failedRelayedMessageEvents = await messenger.queryFilter(
        messenger.filters.FailedRelayedMessage(messageHash),
        fromBlock,
        toBlock
      );
      // if there was an error then return the RELAYED_FAILED state with the appropriate tx receipt
      if (failedRelayedMessageEvents.length > 0) {
        return {
          receiptStatus: MessageReceiptStatus.RELAYED_FAILED,
          transactionReceipt: await failedRelayedMessageEvents[
            failedRelayedMessageEvents.length - 1
          ].getTransactionReceipt(),
        };
      }

      return null as unknown as MessageReceipt;
    };

    // get the messages associated with the tx
    context.crossChainMessenger.getMessagesByTransaction = async (
      transaction: TransactionLike,
      opts: {
        direction?: MessageDirection;
      } = {}
    ): Promise<CrossChainMessage[]> => {
      // Wait for the transaction receipt if the input is waitable.
      await (transaction as TransactionResponse).wait?.();

      // Convert the input to a transaction hash.
      const txHash = toTransactionHash(transaction);

      let receipt: TransactionReceipt;
      if (opts.direction !== undefined) {
        // Get the receipt for the requested direction.
        if (opts.direction === MessageDirection.L1_TO_L2) {
          receipt = await goerliProviderRef.current!.getTransactionReceipt(
            txHash
          );
        } else {
          receipt = await mantleTestnetRef.current!.getTransactionReceipt(
            txHash
          );
        }
      } else {
        // Try both directions, starting with L1 => L2.
        receipt = await goerliProviderRef.current!.getTransactionReceipt(
          txHash
        );
        if (receipt) {
          // eslint-disable-next-line no-param-reassign
          opts.direction = MessageDirection.L1_TO_L2;
        } else {
          receipt = await mantleTestnetRef.current!.getTransactionReceipt(
            txHash
          );
          // eslint-disable-next-line no-param-reassign
          opts.direction = MessageDirection.L2_TO_L1;
        }
      }

      if (!receipt) {
        throw new Error(`unable to find transaction receipt for ${txHash}`);
      }

      // By this point opts.direction will always be defined.
      const contract =
        opts.direction === MessageDirection.L1_TO_L2
          ? context.crossChainMessenger.contracts.l1.L1CrossDomainMessenger
          : context.crossChainMessenger.contracts.l2.L2CrossDomainMessenger;

      // connect the contract to the provider
      const messenger = contract.connect(
        opts.direction === MessageDirection.L1_TO_L2
          ? goerliProviderRef.current!
          : mantleTestnetRef.current!
      );

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
          if (receipt.logs.length > log.logIndex + 1) {
            const next = receipt.logs[log.logIndex + 1];
            if (next.address === messenger.address) {
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
        }) as CrossChainMessage[];
    };

    // find the l1 stateBatchAppenedEvent by batch index
    context.crossChainMessenger.getStateBatchAppendedEventByBatchIndex = async (
      batchIndex
    ) => {
      // connect the contract to the read-only provider but use InfuraRef so that we can search without knowing the expected block
      const stateCommitmentChain =
        context.crossChainMessenger.contracts.l1.StateCommitmentChain.connect(
          goerliInfuraRef.current!
        );

      // check for events in either the last 2000 blocks or 1000 blocks either side of the requested block
      const events = await stateCommitmentChain.queryFilter(
        stateCommitmentChain.filters.StateBatchAppended(batchIndex)
      );
      if (events.length === 0) {
        return null;
      }
      if (events.length > 1) {
        throw new Error(`found more than one StateBatchAppended event`);
      } else {
        return events[0];
      }
    };

    // return the crosschain manager
    return {
      ...context,
      getMessageStatus,
      waitForMessageStatus,
    };
  }, [
    goerliSigner,
    goerliProvider,
    goerliProviderRef,
    mantleTestnetSigner,
    mantleTestnetProvider,
    mantleTestnetRef,
    chain,
  ]);

  // setting readonly providers fresh on every tick to avoid "underlying network changed" errors
  React.useEffect(() => {
    goerliProviderRef.current = goerliProvider;
  }, [goerliProvider]);

  React.useEffect(() => {
    mantleTestnetRef.current = mantleTestnetProvider;
  }, [mantleTestnetProvider]);

  React.useEffect(() => {
    goerliInfuraRef.current = goerliInfuraProvider;
  }, [goerliInfuraProvider]);

  return (
    <MantleSDKContext.Provider value={crossChainMessenger as SDKContext}>
      {children}
    </MantleSDKContext.Provider>
  );
}

const useMantleSDK = () => {
  const context = React.useContext(MantleSDKContext);

  if (context === undefined) {
    throw new Error("useMantleSDK must be used within a CountProvider!");
  }
  return context;
};

const MantleSDKProviderWithErrorBoundary = withErrorBoundary(
  MantleSDKProvider,
  {
    FallbackComponent: ErrorFallback,
    onReset: () => {
      window.location.reload();
    },
  }
);

export {
  MantleSDKProviderWithErrorBoundary as MantleSDKProvider,
  useMantleSDK,
};
