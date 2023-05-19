import { CTAPages } from "@config/constants";
import {
  TransactionResponse,
  TransactionReceipt,
} from "@ethersproject/providers";
import StateContext from "@providers/stateContext";
import { debounce } from "lodash";
import { useContext, useState, useRef, useMemo, useEffect } from "react";
import { useProvider, goerli } from "wagmi";
import { MessageLike } from "@mantleio/sdk";
import { useMantleSDK } from "@providers/mantleSDKContext";
import { useIsChainID } from "./useIsChainID";
import { useSwitchToNetwork } from "./useSwitchToNetwork";

// noop to ignore errors
const noopHandler = () => ({});

// throw error with receipt and message
class TxError extends Error {
  receipt: TransactionReceipt | TransactionResponse;

  constructor(
    message: string | undefined,
    receipt: TransactionReceipt | TransactionResponse
  ) {
    super(message);
    this.name = "TxError";
    this.receipt = receipt;
  }
}

// call the claim method with the given tx
export function useCallClaim(
  l1Tx: undefined | MessageLike,
  onSuccess?: () => void
) {
  // pull state from context
  const { l2TxHashRef, setL2TxHash, setCTAPage } = useContext(StateContext);

  // import crosschain comms
  const { crossChainMessenger } = useMantleSDK();

  // pull goerli provider
  const provider = useProvider({ chainId: goerli.id });

  // check for goerli connection
  const isChainId = useIsChainID(goerli.id);

  // mark loading between callClaim and the useEffect waiting for the finalizeMessage()
  const [isLoading, setIsLoading] = useState(false);

  // allow the claim checks to be debounced
  const commitClaimRef = useRef<() => void>();

  // import the network switch
  const { switchToNetwork } = useSwitchToNetwork();

  // commit claim method...
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const commitClaim = () => {
    if (l1Tx && isChainId && isLoading && crossChainMessenger) {
      // create the claim tx
      crossChainMessenger
        .finalizeMessage(l1Tx)
        .catch((e) => {
          if (
            e.message ===
            "execution reverted: Provided message has already been received."
          ) {
            setIsLoading(false);
            // move to error page - this time we mean it
            setCTAPage(CTAPages.Error);
          }
          return noopHandler() as TransactionResponse | TransactionReceipt;
        })
        .then(async (tx) => {
          try {
            const finalTx = (
              (tx as TransactionResponse)?.wait
                ? await (tx as TransactionResponse)?.wait?.()
                : tx
            ) as TransactionReceipt;
            if (finalTx) {
              setL2TxHash(finalTx.transactionHash);
              // set immediately into state
              l2TxHashRef.current = finalTx.transactionHash;
            }
            return finalTx;
          } catch (e) {
            throw new TxError(e as string | undefined, tx);
          }
        })
        .catch(() => {
          return noopHandler() as TransactionReceipt;
        })
        .then(async (tx) => {
          // re-enable the button so we can try again
          setIsLoading(false);
          // move on if we resolved the tx
          if (tx && tx.blockHash) {
            // move to final page
            setCTAPage(CTAPages.Withdrawn);
            // if provided an onsuccess func
            if (onSuccess) {
              onSuccess();
            }
          }
        });
    }
  };

  // debounce the current callback assigned to commitClaimRef
  const doCommitClaimWithDebounce = useMemo(() => {
    const callback = () => commitClaimRef.current?.();
    return debounce(callback, 100);
  }, []);

  // update the references every render to make sure we have the latest state in the function
  useEffect(() => {
    commitClaimRef.current = commitClaim;
  }, [commitClaim]);

  // initiate claim and make sure we're on the correct network
  const callClaim = async () => {
    // initiate loading/claim state
    setIsLoading(true);
    // first step is to ensure we're on the correct network - we break this up because we need the correct signer to finalise the message
    if (l1Tx && !isChainId) {
      await switchToNetwork(goerli.id).catch(() => {
        setIsLoading(false);
      });
    }
  };

  // when we're in a loading state and have the correct chainId we can attempt to finalise the message
  useEffect(() => {
    doCommitClaimWithDebounce();
  }, [
    l1Tx,
    provider,
    isLoading,
    isChainId,
    crossChainMessenger,
    // when any of the above props change we debounce a call to commitClaim to only initiate one metamask prompt
    doCommitClaimWithDebounce,
  ]);

  return {
    isLoading,
    callClaim,
  };
}
