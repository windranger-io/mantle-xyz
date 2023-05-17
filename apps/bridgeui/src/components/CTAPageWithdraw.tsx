import { debounce } from "lodash";
import { goerli, useProvider } from "wagmi";
import { useContext, useEffect, useMemo, useRef, useState } from "react";

import StateContext from "@providers/stateContext";

import {
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/providers";

import { useSwitchToNetwork } from "@hooks/useSwitchToNetwork";
import { useIsChainID } from "@hooks/useIsChainID";
import { MessageLike } from "@mantleio/sdk";
import { CTAPages } from "@config/constants";

import { MdClear } from "react-icons/md";
import { Button, Typography } from "@mantle/ui";

import TxLink from "@components/CTAPageTxLink";

// noop to ignore errors
const noopHandler = () => ({});
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

export default function CTAPageWithdraw({
  l1Tx,
  l1TxHash,
  l2TxHash,
  setL2TxHash,
  setCTAPage,
  closeModal,
}: {
  l1Tx: undefined | MessageLike;
  l1TxHash: string | boolean;
  l2TxHash: string | boolean;
  setL2TxHash: (hash: string) => void;
  setCTAPage: (page: CTAPages) => void;
  closeModal: () => void;
}) {
  // pull state from context
  const {
    ctaChainId: chainId,
    crossChainMessenger,
    l2TxHashRef,
  } = useContext(StateContext);

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
    isChainId,
    isLoading,
    crossChainMessenger,
    setCTAPage,
    setL2TxHash,
    // when any of the above props change we debounce a call to commitClaim to hopefully only initiate the one metamask prompt
    doCommitClaimWithDebounce,
  ]);

  return (
    <>
      <span className="flex justify-between align-middle">
        <Typography variant="modalHeading" className="text-center w-full">
          Claim your withdrawal
        </Typography>
        <Typography variant="modalHeading" className="text-white w-auto">
          <MdClear onClick={closeModal} className="cursor-pointer" />
        </Typography>
      </span>
      <Button
        type="button"
        size="full"
        className="h-14 flex flex-row gap-4 text-center items-center justify-center my-4"
        disabled={isLoading}
        onClick={callClaim}
      >
        <div className="flex flex-row gap-4 items-center mx-auto w-fit">
          <span>
            Claim
            {isLoading ? `ing` : ``}
          </span>

          {(isLoading && (
            <div role="status">
              <svg
                aria-hidden="true"
                className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          )) || <div />}
        </div>
      </Button>
      <div>
        <span className="flex text-center text-md mb-4">
          Your wallet will prompt you to switch back to Goerli Network to claim
          your tokens.
        </span>
      </div>
      <div className="flex flex-col gap-4">
        <TxLink chainId={chainId} txHash={l1TxHash} />
        <TxLink chainId={chainId === 5 ? 5001 : 5} txHash={l2TxHash} />
      </div>
    </>
  );
}
