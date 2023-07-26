/* eslint-disable no-underscore-dangle, no-await-in-loop */

"use client";

import * as React from "react";

import {
  CrossChainMessenger,
  MessageDirection,
  MessageStatus,
  MessageReceipt,
  MessageReceiptStatus,
  MessageLike,
  CrossChainMessage,
  StateRoot,
  TransactionLike,
  toTransactionHash,
  StateRootBatch,
} from "@mantleio/sdk";

import * as contracts from "@mantleio/contracts";

import { hashCrossDomainMessage } from "@mantleio/core-utils";

import { CHAINS_FORMATTED, L1_CHAIN_ID, L2_CHAIN_ID } from "@config/constants";

import { useNetwork, usePublicClient, useWalletClient } from "wagmi";
import type {
  Provider,
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/providers";
import { BytesLike, Signer, ethers, providers } from "ethers";

import { timeout } from "@utils/toolSet";

import { gql, useApolloClient } from "@apollo/client";
import { useMemo } from "react";

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

type MantleSDK = {
  crossChainMessenger: CrossChainMessenger;
  waitForMessageStatus: WaitForMessageStatus;
  getMessageStatus: GetMessageStatus;
  toCrossChainMessage: (msg: MessageLike) => Promise<CrossChainMessage>;
  getMessageStateRoot: (msg: MessageLike) => Promise<{
    stateRoot: string;
    stateRootIndexInBatch: number;
    batch: StateRootBatch;
    timestamp: number;
  } | null>;
};

const MantleSDKContext = React.createContext<MantleSDK | undefined>(undefined);

interface MantleSDKProviderProps {
  children: React.ReactNode;
}

// Construct query to pull stateBatch at index
const GetBatchStateAtIndexQuery = gql`
  query GetBatchStateAtIndex($transactionIndex: String!) {
    stateBatchAppends(
      first: 1
      orderBy: batchIndex
      orderDirection: desc
      where: { prevTotalElements_lte: $transactionIndex }
    ) {
      txHash
      txBlock
      batchIndex
      batchRoot
      batchSize
      prevTotalElements
      signature
      extraData
    }
  }
`;

// Exports a provider containing the crossChainMessenger and some additional overridden helper methods
function MantleSDKProvider({ children }: MantleSDKProviderProps) {
  // currently selected chain according to wagmi (associated with provider/signer combo)
  const { chain } = useNetwork();

  // pull the challenge period once
  const challengePeriod = React.useRef<number>();
  const crossChainMessages = React.useRef<Record<string, CrossChainMessage>>(
    {}
  );
  const batchIndexChecks = React.useRef<{
    [key: string]: {
      stateRoot: string;
      stateRootIndexInBatch: number;
      batch: StateRootBatch;
      timestamp: number;
    };
  }>({});

  // setting providers against refs because we freeze state in a render frame and need to step out
  // of that frame by ref to avoid an "underlying network changed" error if the user switches chain
  const layer1InfuraRef = React.useRef<Provider>();
  const layer1ProviderRef = React.useRef<Provider>();
  const layer1SignerRef = React.useRef<Signer>();
  const mantleTestnetRef = React.useRef<Provider>();

  // get the apolloClient
  const gqclient = useApolloClient();

  // pull all the signers/privders and set handlers and associate boundaries as we go
  const walletClient = useWalletClient({ chainId: L1_CHAIN_ID });
  const layer1Signer = useMemo(() => {
    if (walletClient.data) {
      const { account, chain: l1Chain, transport } = walletClient.data!;
      const network = {
        chainId: l1Chain?.id,
        name: l1Chain?.name,
        ensAddress: l1Chain?.contracts?.ensRegistry?.address,
      };
      const provider = new providers.Web3Provider(transport, network);
      const signer = provider.getSigner(account.address);
      return signer;
    }
    return undefined;
  }, [walletClient]);

  // get an infura backed provider so we can search through more blocks - this enables the full sdk to work
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const layer1Infura = React.useMemo(
    () =>
      new ethers.providers.JsonRpcProvider("/rpc", {
        chainId: L1_CHAIN_ID,
        name: CHAINS_FORMATTED[L1_CHAIN_ID].name,
      }),
    []
  );

  // use public l1 Provider for gernal lookups (gas etc)
  const layer1Provider = React.useMemo(
    () =>
      new providers.JsonRpcProvider(
        CHAINS_FORMATTED[L1_CHAIN_ID].rpcUrls.public.http[0]
      ),
    []
  );

  // pull all the signers/privders and set handlers and associate boundaries as we go
  const mantleWalletClient = useWalletClient({ chainId: L2_CHAIN_ID });
  const mantleSigner = useMemo(() => {
    if (mantleWalletClient?.data) {
      const { account, chain: l2Chain, transport } = mantleWalletClient.data!;
      const network = {
        chainId: l2Chain?.id,
        name: l2Chain?.name,
        ensAddress: l2Chain?.contracts?.ensRegistry?.address,
      };
      const provider = new providers.Web3Provider(transport, network);
      const signer = provider.getSigner(account.address);
      return signer;
    }
    return undefined;
  }, [mantleWalletClient]);

  // get the provider for the chosen chain
  const publicClient = usePublicClient({ chainId: L2_CHAIN_ID });

  // create an ethers provider from the publicClient
  const mantleProvider = useMemo(() => {
    const { chain: mantleChain, transport } = publicClient;
    const network = {
      chainId: mantleChain.id,
      name: mantleChain.name,
      ensAddress: mantleChain.contracts?.ensRegistry?.address,
    };
    if (transport.type === "fallback")
      return new providers.FallbackProvider(
        (transport.transports as { value: { url: string } }[]).map(
          ({ value }) => new providers.JsonRpcProvider(value?.url, network)
        )
      );
    return new providers.JsonRpcProvider(transport.url, network);
  }, [publicClient]);

  // construct a crossChainMessenger - this is responsible for nearly all of our web3 interactions
  const crossChainMessenger = React.useMemo(() => {
    // avoid building the manager if we don't have an approproate signer for the currently selected chain (this avoids errors on hw wallets)
    if (
      (chain?.id === L1_CHAIN_ID &&
        (layer1Signer === undefined || layer1Signer === null)) ||
      (chain?.id === L2_CHAIN_ID &&
        (mantleSigner === undefined || mantleSigner === null)) ||
      !layer1Provider ||
      !mantleProvider
    )
      return { crossChainMessenger: undefined };

    // context only stores the manager
    const context: MantleSDK = {
      crossChainMessenger: new CrossChainMessenger({
        l1ChainId: L1_CHAIN_ID,
        l2ChainId: L2_CHAIN_ID,
        l1SignerOrProvider:
          chain?.id === L1_CHAIN_ID ? layer1Signer! : layer1Provider!,
        l2SignerOrProvider:
          chain?.id === L2_CHAIN_ID ? mantleSigner! : mantleProvider!,
      }),
    } as MantleSDK;

    /*
     * override these methods to attach to current network ref (avoids underlying network changed error)
     */

    // memoise gets for crossChainMessages
    context.toCrossChainMessage = async (msg: MessageLike) => {
      const key = (
        typeof msg === "string"
          ? msg
          : (msg as TransactionResponse).hash ||
            (msg as TransactionReceipt).transactionHash
      ) as string;
      // set the value once
      crossChainMessages.current[key] =
        crossChainMessages.current[key] ||
        (await context.crossChainMessenger.toCrossChainMessage(msg));

      return crossChainMessages.current[key];
    };

    // read the challengePeriodSeconds from the contract
    context.crossChainMessenger.getChallengePeriodSeconds =
      async (): Promise<number> => {
        const contract =
          context.crossChainMessenger.contracts.l1.StateCommitmentChain.connect(
            layer1ProviderRef.current!
          );

        // get the proof window
        const period =
          challengePeriod.current || (await contract.FRAUD_PROOF_WINDOW());

        // store the new period
        challengePeriod.current = period;

        return period.toNumber();
      };

    // get the stateRootBatch associated with this transactionIndex (get the result from graphql)
    context.crossChainMessenger.getStateRootBatchByTransactionIndex = async (
      transactionIndex
    ) => {
      // fetch the appendStateBatch event from supagraph that matches this transactionIndex
      const { data } = await gqclient.query({
        query: GetBatchStateAtIndexQuery,
        variables: {
          transactionIndex: `${transactionIndex}`,
        },
        // disable apollo cache to force new fetch call every invoke
        fetchPolicy: "no-cache",
        // use next cache to store the responses for 30s
        context: {
          fetchOptions: {
            next: { revalidate: 30 },
          },
        },
      });

      // return null if we didn't find the index
      if (
        data.stateBatchAppends.length === 0 ||
        parseInt(data.stateBatchAppends[0].prevTotalElements, 10) +
          parseInt(data.stateBatchAppends[0].batchSize, 10) <=
          transactionIndex
      ) {
        return null;
      }

      // if we have results, we should only have 1
      const stateBatchAppendedEvent = data.stateBatchAppends[0];

      // we will need to get the transaction for the txHash provided by the graphql response
      const stateBatchTransaction =
        await layer1InfuraRef.current?.getTransaction(
          stateBatchAppendedEvent.txHash
        );

      // check both contracts for the initial call that set the stateRoots
      let stateRoots;
      try {
        // eslint-disable-next-line prefer-destructuring
        stateRoots =
          context.crossChainMessenger.contracts.l1.StateCommitmentChain.interface.decodeFunctionData(
            "appendStateBatch",
            stateBatchTransaction?.data as BytesLike
          )[0];
      } catch (e) {
        // eslint-disable-next-line prefer-destructuring
        stateRoots =
          context.crossChainMessenger.contracts.l1.Rollup.interface.decodeFunctionData(
            "createAssertionWithStateBatch",
            stateBatchTransaction?.data as BytesLike
          )[2];
      }

      // return the content from supagraph + the stateRoots from the transaction
      return {
        blockNumber: parseInt(stateBatchAppendedEvent.txBlock, 10),
        stateRoots,
        header: {
          batchRoot: stateBatchAppendedEvent.batchRoot,
          signature: stateBatchAppendedEvent.signature,
          extraData: stateBatchAppendedEvent.extraData,
          batchIndex: ethers.BigNumber.from(stateBatchAppendedEvent.batchIndex),
          batchSize: ethers.BigNumber.from(stateBatchAppendedEvent.batchSize),
          prevTotalElements: ethers.BigNumber.from(
            stateBatchAppendedEvent.prevTotalElements
          ),
        },
      };
    };

    // get the stateRoot for a given message
    context.getMessageStateRoot = async (message: MessageLike) => {
      const resolved = await context.toCrossChainMessage(message);

      // if the stateRoot hasnt been checked yet...
      if (!batchIndexChecks.current[resolved.transactionHash]) {
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

        // get the block details
        const bn = stateRootBatch.blockNumber;
        const block = await layer1ProviderRef.current!.getBlock(bn);
        const { timestamp } = block;

        // memoise the check
        batchIndexChecks.current[resolved.transactionHash] = {
          stateRoot: stateRootBatch.stateRoots[indexInBatch],
          stateRootIndexInBatch: indexInBatch,
          batch: stateRootBatch,
          timestamp,
        };
      }

      // return all details about the stateRoot check
      return batchIndexChecks.current[resolved.transactionHash];
    };

    // assign method to context with expected signature
    context.crossChainMessenger.getMessageStateRoot = async (
      message: MessageLike
    ): Promise<StateRoot | null> => {
      const res = await context.getMessageStateRoot(message);
      return res
        ? {
            stateRoot: res.stateRoot,
            stateRootIndexInBatch: res.stateRootIndexInBatch,
            batch: res.batch,
          }
        : res;
    };

    // find the relayed messageReceipt
    context.crossChainMessenger.getMessageReceipt = async (
      message: TransactionResponse
    ): Promise<MessageReceipt> => {
      const resolved = await context.toCrossChainMessage(message);

      // memoise the IS_L1_TO_L2 check, we'll do this a few times to make sure we're pulling data from the correct contract/network
      const IS_L1_TO_L2 = resolved.direction === MessageDirection.L1_TO_L2;

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

      // get the provider to read the receipt from
      const provider = IS_L1_TO_L2
        ? mantleTestnetRef.current!
        : layer1ProviderRef.current!;

      // connect to the fixed provider
      const messenger = unconnectedMessenger.connect(
        IS_L1_TO_L2 ? mantleTestnetRef.current! : layer1InfuraRef.current!
      );

      // look for successfully relayed messages
      const relayedMessageEvents = await messenger
        .queryFilter(messenger.filters.RelayedMessage(messageHash))
        .catch(() => []);

      // if the relay was successful only once then return the receipt
      if (relayedMessageEvents.length === 1) {
        return {
          receiptStatus: MessageReceiptStatus.RELAYED_SUCCEEDED,
          transactionReceipt: await provider.getTransactionReceipt(
            relayedMessageEvents[0].transactionHash
          ),
        };
      }

      // otherwise we have a bad state...[]
      if (relayedMessageEvents.length > 1) {
        throw new Error(`multiple successful relays for message`);
      }

      // if we didn't find any events then look for errors (using the same block constraints)
      const failedRelayedMessageEvents = await messenger.queryFilter(
        messenger.filters.FailedRelayedMessage(messageHash)
      );
      // if there was an error then return the RELAYED_FAILED state with the appropriate tx receipt
      if (failedRelayedMessageEvents.length > 0) {
        return {
          receiptStatus: MessageReceiptStatus.RELAYED_FAILED,
          transactionReceipt: await provider.getTransactionReceipt(
            failedRelayedMessageEvents[failedRelayedMessageEvents.length - 1]
              .transactionHash
          ),
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
          receipt = await layer1ProviderRef.current!.getTransactionReceipt(
            txHash
          );
        } else {
          receipt = await mantleTestnetRef.current!.getTransactionReceipt(
            txHash
          );
        }
      } else {
        // Try both directions, starting with L1 => L2.
        receipt = await layer1ProviderRef.current!.getTransactionReceipt(
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
          ? layer1ProviderRef.current!
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
          layer1InfuraRef.current!
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

    context.crossChainMessenger.finalizeMessage = async (message, opts) => {
      return layer1SignerRef.current!.sendTransaction(
        await context.crossChainMessenger.populateTransaction.finalizeMessage(
          message,
          opts
        )
      );
    };

    context.crossChainMessenger.populateTransaction.finalizeMessage = async (
      message,
      opts
    ) => {
      const resolved = await context.toCrossChainMessage(message);
      if (resolved.direction === MessageDirection.L1_TO_L2) {
        throw new Error(`cannot finalize L1 to L2 message`);
      }
      const proof = await context.crossChainMessenger.getMessageProof(resolved);
      const legacyL1XDM = new ethers.Contract(
        context.crossChainMessenger.contracts.l1.L1CrossDomainMessenger.address,
        contracts.getContractInterface("L1CrossDomainMessenger"),
        // use l1 provider
        layer1InfuraRef.current
      );
      return legacyL1XDM.populateTransaction.relayMessage(
        resolved.target,
        resolved.sender,
        resolved.message,
        resolved.messageNonce,
        proof,
        (opts === null || opts === undefined ? undefined : opts.overrides) || {}
      );
    };

    /*
     * Exposing new instances of these two methods so that we can return the receipt directly from the call
     */

    // allow messageStatus to optionally return the receipt aswell as the status
    context.getMessageStatus = async (
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
      const resolved = await context.toCrossChainMessage(message);

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
        // no receipt - check if the message was published (if we do a successful stateRoot check we could memoise the rest of this)
        const stateRoot = await context.getMessageStateRoot(resolved);
        // no published
        if (stateRoot === null) {
          status = MessageStatus.STATE_ROOT_NOT_PUBLISHED;
        } else {
          // published - find out in which block
          challengePeriod.current =
            challengePeriod.current ||
            (await context.crossChainMessenger.getChallengePeriodSeconds());
          // now get the latest block...
          const latestBlock = await layer1ProviderRef.current!.getBlock(
            "latest"
          );
          // check that the challengePeriod period has ellapsed before marking as ready
          if (
            stateRoot.timestamp + challengePeriod.current >
            latestBlock.timestamp
          ) {
            // now get the latest block...
            const nextBlock = await layer1ProviderRef.current!.getBlock(
              "latest"
            );
            if (
              stateRoot.timestamp + challengePeriod.current >
              nextBlock.timestamp
            ) {
              status = MessageStatus.IN_CHALLENGE_PERIOD;
            } else {
              status = MessageStatus.READY_FOR_RELAY;
            }
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
    context.waitForMessageStatus = async (
      message: MessageLike,
      status: MessageStatus,
      opts: {
        pollIntervalMs?: number;
        timeoutMs?: number;
      } = {}
    ): Promise<MessageReceipt> => {
      // Resolving once up-front is slightly more efficient.
      const resolved = await context.toCrossChainMessage(message);

      let totalTimeMs = 0;
      while (totalTimeMs < (opts.timeoutMs || Infinity)) {
        const tick = Date.now();
        const { status: currentStatus, receipt } =
          (await context.getMessageStatus(resolved, {
            returnReceipt: true,
          })) as unknown as {
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

    // attach this to internal getMessageStatus
    context.crossChainMessenger.getMessageStatus = async (message) => {
      return (await context.getMessageStatus(message)) as MessageStatus;
    };

    // attach this to internal waitForMessageStatus
    context.crossChainMessenger.waitForMessageStatus = async (
      message,
      status
    ) => {
      // wait for the status
      await context.waitForMessageStatus(message, status);

      return undefined;
    };

    // return the crosschain manager
    return context;
  }, [
    layer1Signer,
    layer1Provider,
    layer1InfuraRef,
    layer1ProviderRef,
    mantleSigner,
    mantleProvider,
    gqclient,
    chain,
    challengePeriod,
    batchIndexChecks,
  ]);

  // setting readonly providers fresh on every tick to avoid "underlying network changed" errors
  React.useEffect(() => {
    layer1InfuraRef.current = layer1Infura;
  }, [layer1Infura]);

  React.useEffect(() => {
    layer1ProviderRef.current = layer1Provider;
  }, [layer1Provider]);

  React.useEffect(() => {
    mantleTestnetRef.current = mantleProvider;
  }, [mantleProvider]);

  React.useEffect(() => {
    layer1SignerRef.current = layer1Signer as Signer;
  }, [layer1Signer]);

  return (
    <MantleSDKContext.Provider value={crossChainMessenger as MantleSDK}>
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

export { useMantleSDK, MantleSDKProvider };
