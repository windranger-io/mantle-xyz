import { CTAPages, L1_CHAIN_ID } from "@config/constants";
import {
  TransactionResponse,
  TransactionReceipt,
} from "@ethersproject/providers";
import StateContext from "@providers/stateContext";
import { useContext, useState } from "react";
import { MessageLike, MessageReceipt, MessageStatus } from "@ethan-bedrock/sdk";
import { useMantleSDK } from "@providers/mantleSDKContext";
import { useSwitchToNetwork } from "@hooks/web3/write/useSwitchToNetwork";

// noop to ignore errors
const noopHandler = () => ({});

// throw error with receipt and message
class TxError extends Error {
  receipt: true | TransactionReceipt | TransactionResponse;

  constructor(
    message: string | undefined,
    receipt: true | TransactionReceipt | TransactionResponse
  ) {
    super(message);
    this.name = "TxError";
    this.receipt = receipt;
  }
}

// call the prove method with the given tx
export function useCallProve(
  tx1: undefined | MessageLike,
  checkBeforeProve: boolean = false,
  storeProgress: boolean = true,
  onSuccess?: (tx: TransactionReceipt) => void,
  onError?: (e: string) => void
) {
  // pull state from context
  const { tx2HashRef, setTx2Hash, setCTAPage } = useContext(StateContext);

  // import crosschain comms
  const { crossChainMessenger, getMessageStatus } = useMantleSDK();

  const { switchToNetwork } = useSwitchToNetwork();

  // mark loading between callProve and the useEffect waiting for the finalizeMessage()
  const [isLoading, setIsLoading] = useState(false);

  // commit prove method...
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const commitProve = () => {
    if (tx1 && crossChainMessenger && getMessageStatus) {
      // check if a prove has already been made - if it has - return that instead
      const checkForProve = async () => {
        return getMessageStatus(tx1, { returnReceipt: true }).then(
          async (res) => {
            const typedRes = res as {
              status: MessageStatus;
              receipt: MessageReceipt;
            };
            if (typedRes.status === MessageStatus.RELAYED) {
              if (storeProgress) {
                setTx2Hash(typedRes.receipt.transactionReceipt.transactionHash);
                // set immediately into state
                tx2HashRef.current =
                  typedRes.receipt.transactionReceipt.transactionHash;
              }
              // return the completed tx receipt
              return typedRes.receipt.transactionReceipt;
            }
            // throw on incomplete
            throw new Error("incomplete");
          }
        );
      };

      // make a prove if not already proveed
      const makeProve = async () => {
        return crossChainMessenger
          .proveMessage(tx1)
          .catch((e) => {
            if (
              e.reason === "messenger has no L1 signer" ||
              e.reason === "underlying network changed" ||
              e.message === "messenger has no L1 signer" ||
              e.message === "underlying network changed"
            ) {
              setIsLoading(true);
              switchToNetwork(L1_CHAIN_ID)
                .catch(() => {
                  setIsLoading(false);
                  return false;
                })
                .then((completed) => {
                  if (completed !== false) {
                    setTimeout(() => {
                      makeProve()
                        .catch(() => {
                          return noopHandler() as TransactionReceipt;
                        })
                        .then(async (tx) => {
                          // move on if we resolved the tx
                          if (tx && tx !== true && tx.blockHash) {
                            if (storeProgress) {
                              // move to final page
                              setCTAPage(CTAPages.Withdrawn);
                            }
                            // if provided an onsuccess func
                            if (onSuccess) {
                              onSuccess(tx);
                            }
                            // complete
                            setIsLoading(false);
                          } else if (tx !== true) {
                            // re-enable the button so we can try again
                            setIsLoading(false);
                          }
                        });
                    });
                  } else {
                    setIsLoading(false);
                  }
                });
              return true;
            }
            if (
              e.message ===
              "execution reverted: Provided message has already been received."
            ) {
              // if this prove has already been made we can return the checkFoProve response (tx2 receipt)
              return checkForProve();
            }
            if (onError) {
              onError(e.reason || e.message);
            }
            return noopHandler() as TransactionResponse | TransactionReceipt;
          })
          .then(async (tx) => {
            try {
              const finalTx = (
                (tx as TransactionResponse)?.wait
                  ? await (tx as TransactionResponse)?.wait?.()
                  : tx
              ) as true | TransactionReceipt;
              if (finalTx && finalTx !== true && storeProgress) {
                setTx2Hash(finalTx.transactionHash);
                // set immediately into state
                tx2HashRef.current = finalTx.transactionHash;
              }
              return finalTx;
            } catch (e) {
              throw new TxError(e as string | undefined, tx);
            }
          });
      };

      // run through the process...
      (
        new Promise((resolve) => {
          resolve(
            checkBeforeProve
              ? checkForProve().catch((e) => {
                  // only incomplete bridge tx's need to be caught and made...
                  if (e.message === "incomplete") {
                    return makeProve();
                  }
                  throw e;
                })
              : makeProve()
          );
        }) as Promise<true | TransactionReceipt>
      )
        .catch(() => {
          return noopHandler() as TransactionReceipt;
        })
        .then(async (tx) => {
          // move on if we resolved the tx
          if (tx && tx !== true && tx.blockHash) {
            if (storeProgress) {
              // move to final page
              setCTAPage(CTAPages.Withdrawn);
            }
            // if provided an onsuccess func
            if (onSuccess) {
              onSuccess(tx);
            }
            // complete
            setIsLoading(false);
          } else if (tx !== true) {
            // re-enable the button so we can try again
            setIsLoading(false);
          }
        });
    }
  };

  // initiate prove and make sure we're on the correct network
  const callProve = async (): Promise<void> => {
    // initiate loading/prove state
    setIsLoading(true);
    // first step is to ensure we're on the correct network - we break this up because we need the correct signer to finalise the message
    if (tx1) {
      return commitProve();
    }
    return Promise.resolve();
  };

  return {
    isLoading,
    callProve,
  };
}
