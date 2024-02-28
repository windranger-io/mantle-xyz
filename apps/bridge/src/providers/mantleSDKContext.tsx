/* eslint-disable no-underscore-dangle, no-await-in-loop */

"use client";

import * as React from "react";

import {
  CrossChainMessenger,
  MessageDirection,
  MessageStatus,
  MessageReceipt,
  MessageLike,
  CrossChainMessage,
  StateRoot,
  StateRootBatch,
  // CONTRACT_ADDRESSES,
} from "@mantleio/sdk";

// import * as contracts from "@mantleio/contracts";

import { sleep } from "@mantleio/core-utils";

import {
  CHAINS_FORMATTED,
  L1_CHAIN_ID,
  L2_CHAIN_ID,
  IS_MANTLE_V2,
} from "@config/constants";

import { useNetwork, useWalletClient } from "wagmi";
import type {
  Provider,
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/providers";
import { Signer, ethers, providers } from "ethers";

// import { timeout } from "@utils/toolSet";

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

  // create an ethers provider from the publicClient
  const mantleProvider = useMemo(() => {
    return new providers.JsonRpcProvider(
      CHAINS_FORMATTED[L2_CHAIN_ID].rpcUrls.public.http[0]
    );
  }, []);

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

    // const contractAddr = CONTRACT_ADDRESSES[5003];
    // contractAddr.l1.OptimismPortal =
    //   "0xB3db4bd5bc225930eD674494F9A4F6a11B8EFBc8";
    // contractAddr.l1.L2OutputOracle =
    //   "0x4121dc8e48Bc6196795eb4867772A5e259fecE07";
    // contractAddr.l1.L1StandardBridge =
    //   "0x21F308067241B2028503c07bd7cB3751FFab0Fb2";
    // contractAddr.l1.L1CrossDomainMessenger =
    //   "0x37dAC5312e31Adb8BB0802Fc72Ca84DA5cDfcb4c";
    // context only stores the manager
    const context: MantleSDK = {
      crossChainMessenger: new CrossChainMessenger({
        l1ChainId: L1_CHAIN_ID,
        l2ChainId: L2_CHAIN_ID,
        l1SignerOrProvider:
          chain?.id === L1_CHAIN_ID ? layer1Signer! : layer1Provider!,
        l2SignerOrProvider:
          chain?.id === L2_CHAIN_ID ? mantleSigner! : mantleProvider!,
        bedrock: IS_MANTLE_V2,
        // contracts: contractAddr,
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
      // attempt to fetch the messages receipt
      const receipt = await context.crossChainMessenger.getMessageReceipt(
        message
      );

      const status: MessageStatus =
        await context.crossChainMessenger.getMessageStatus(message);

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

        await sleep(opts.pollIntervalMs || 4000);
        totalTimeMs += Date.now() - tick;
      }

      throw new Error(`timed out waiting for message status change`);
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
    // layer1InfuraRef,
    layer1ProviderRef,
    mantleSigner,
    mantleProvider,
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
