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
} from "@mantleio/sdk";

import { ethers } from "ethers";

import { goerli } from "wagmi/chains";
import { MANTLE_TESTNET_CHAIN } from "@config/constants";

import { useSigner, useProvider, useNetwork } from "wagmi";
import type { FallbackProvider, Provider } from "@ethersproject/providers";

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

  // pull all the signers/privders and set handlers and associate boundaries as we go
  const { data: goerliSigner, error: goerliSignerError } = useSigner({
    chainId: GOERLI_CHAIN_ID,
  });
  useErrorHandler(goerliSignerError);
  // get an infura backed provider so we can search through more blocks
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const goerliProvider = new ethers.providers.InfuraProvider(
    "goerli",
    // eslint-disable-next-line @typescript-eslint/dot-notation
    process.env["NEXT_PUBLIC_INFURA_API_KEY"]
  );
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
    chain,
  ]);

  // setting readonly providers fresh on every tick to avoid "underlying network changed" errors
  React.useEffect(() => {
    goerliProviderRef.current = goerliProvider;
  }, [goerliProvider]);

  React.useEffect(() => {
    mantleTestnetRef.current = mantleTestnetProvider;
  }, [mantleTestnetProvider]);

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
