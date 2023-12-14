import {
  L1_CHAIN_ID,
  CTAPages,
  Direction,
  Token,
  IS_MANTLE_V2,
  WithdrawStatus,
} from "@config/constants";
import {
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/providers";
import { UseMutateFunction } from "@tanstack/react-query";

import { useContext } from "react";
import StateContext from "@providers/stateContext";
import { useMantleSDK } from "@providers/mantleSDKContext";

import { timeout } from "@utils/toolSet";
import { parseUnits } from "ethers/lib/utils.js";

import { ToastProps, useToast } from "@hooks/useToast";
import { useMutation, useQuery } from "wagmi";
import { formatTime } from "@mantle/utils";
import { useWaitForRelay } from "./useWaitForRelay";

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

// call this method to initiate the bridge procedure
export function useCallBridge(
  direction: Direction,
  selected: Token,
  destination: Token
): UseMutateFunction<
  {
    receipt: TransactionReceipt | TransactionResponse;
  },
  TxError,
  TransactionReceipt | TransactionResponse | undefined,
  unknown
> {
  // get the direction as string
  const directionString = Direction[direction] as keyof typeof Direction;

  // import crossChain comms
  const { crossChainMessenger } = useMantleSDK();

  // get and store the challengePeriod
  const { data: challengePeriod } = useQuery(
    [
      "CHALLENGE_PERIOD",
      {
        l1: crossChainMessenger?.l1ChainId,
      },
    ],
    async () => {
      return crossChainMessenger?.getChallengePeriodSeconds();
    }
  );

  // build toast to return to the current page
  const { updateToast, deleteToast } = useToast();

  // hydrate context into state
  const {
    chainId,
    destinationTokenAmount,
    ctaChainId,
    isCTAPageOpenRef,
    ctaErrorReset,
    tx1HashRef,
    tx2HashRef,
    resetBalances,
    setCTAChainId,
    setTx1,
    setTx1Hash,
    setTx2Hash,
    setCTAStatus,
    setCTAPage,
    setIsCTAPageOpen,
    setWithdrawStatus,
  } = useContext(StateContext);

  // setup the waitForRelay with the given direction
  const waitForRelay = useWaitForRelay({ direction });

  // main CTA method - we keep this mutation frame open until it error's or the tx succeeds - this keeps a closure over the current state so that we can return to it (via toasts)
  const { mutate: callBridgeCTA } = useMutation({
    mutationFn: async (
      givenReceipt?: TransactionReceipt | TransactionResponse
    ) => {
      let receipt: TransactionReceipt | TransactionResponse = {} as
        | TransactionReceipt
        | TransactionResponse;

      // try and catch to wrap thrown error with the known receipt
      try {
        // initial status
        setCTAStatus("Waiting for tx approval...");

        // throw errors in try context
        const errorHandler = (e: unknown) => {
          throw e;
        };

        const isDeposit = chainId === L1_CHAIN_ID;
        const isMantleV2 = IS_MANTLE_V2;
        const isETH = selected.name === "ETH";
        const isMNT = selected.name === "Mantle";
        // if we've been given a receipt then the tx is already out there...
        if (!givenReceipt) {
          // for each type of interaction...
          if (isDeposit && isETH) {
            // depositETH
            receipt = await crossChainMessenger!
              .depositETH(parseUnits(destinationTokenAmount, selected.decimals))
              .catch(errorHandler);
          } else if (isDeposit && isMNT && isMantleV2) {
            // mantle v2 depositMNT
            receipt = await crossChainMessenger!
              .depositMNT(parseUnits(destinationTokenAmount, selected.decimals))
              .catch(errorHandler);
          } else if (isDeposit) {
            // depositERC20
            receipt = await crossChainMessenger!
              .depositERC20(
                selected.address,
                destination.address,
                parseUnits(destinationTokenAmount, selected.decimals)
              )
              .catch(errorHandler);
          } else if (isETH) {
            // withdrawETH
            receipt = await crossChainMessenger!
              .withdrawETH(
                parseUnits(destinationTokenAmount, selected.decimals)
              )
              .catch(errorHandler);
          } else if (isMNT && isMantleV2) {
            // mantle v2 withdrawMNT
            receipt = await crossChainMessenger!
              .withdrawMNT(
                parseUnits(destinationTokenAmount, selected.decimals)
              )
              .catch(errorHandler);
          } else {
            // withdrawERC20
            receipt = await crossChainMessenger!
              .withdrawERC20(
                // switch these because the destination is l1 and the selected is l2
                destination.address,
                selected.address,
                parseUnits(destinationTokenAmount, selected.decimals)
              )
              .catch(errorHandler);
          }
        } else {
          // restore from given
          receipt = givenReceipt;
        }

        // txHash from messageLike
        const txHash =
          (receipt as TransactionReceipt).transactionHash ||
          (receipt as TransactionResponse).hash;

        // load toast as soon as the tx is approved
        const toastProps = {
          id: `${txHash}`,
          type: "success",
          buttonText: `Restore loading screen`,
          borderLeft:
            ctaChainId === L1_CHAIN_ID ? "bg-yellow-500" : "bg-blue-600",
          content: (
            <div>
              <div>
                {ctaChainId === L1_CHAIN_ID ? "Deposit" : "Withdrawal"}{" "}
                initiated
              </div>
              <div className="text-sm">
                {ctaChainId === L1_CHAIN_ID
                  ? "Assets will be available on Mantle in ~12 mins"
                  : `Will be available to claim in ${`~${formatTime(
                      challengePeriod && challengePeriod < 1200
                        ? 1200
                        : challengePeriod || 1200
                    )}`}`}
              </div>
            </div>
          ),
        } as ToastProps;

        // only update toast when it is not deposit
        if (ctaChainId !== L1_CHAIN_ID) {
          // update the content and the callbacks
          updateToast({
            ...toastProps,
            onButtonClick: () => {
              setCTAChainId(chainId);
              setTx1(receipt);
              setTx1Hash(txHash);
              setTx2Hash(false);
              setCTAPage(CTAPages.Loading);
              setIsCTAPageOpen(true);
              // mark open now
              isCTAPageOpenRef.current = true;

              // close the toast when clicked...
              return false;
            },
          });
        }

        // set the l1 into storage
        setTx1(receipt);

        // store the hash as soon as we make the tx
        setTx1Hash(txHash);

        // setting this so that its present without the need for a tick
        tx1HashRef.current = (txHash || "").toString();

        // action was approved now we're waiting for confirmation
        setCTAStatus("Tx approved, waiting for confirmation...");

        // move to the loading page
        setCTAPage(CTAPages.Loading);
        setWithdrawStatus(WithdrawStatus.SENDING_TX);

        // wait for the receipt if its not already present
        if (
          !(receipt as TransactionReceipt).status &&
          (receipt as TransactionResponse).wait
        ) {
          // only throw when we detect network issues
          const retryWait = async (): Promise<TransactionReceipt> => {
            // wait() for the tx to gather confirmations
            receipt = await (receipt as TransactionResponse)
              .wait()
              // keep retrying till we fill the error stack
              .catch(async (e) => {
                // throw server errors to the outside (we might also want to detect bad transactions here - need to check all possible error reasons)
                if (e.reason === "underlying network changed") {
                  // throw in outer context to stop the await and to move to (restorable) error state
                  throw e;
                }
                // wait for 12 seconds (1 pollInterval) before trying again
                await timeout(12000);

                // retry the await()
                return retryWait();
              });

            return receipt;
          };

          // keep retrying until this goes through (if it fails it should only be because of network connection issues/reorgs(unlikely))...
          receipt = await retryWait().catch(errorHandler);
        }

        // balance should have changed after the first tx
        resetBalances();

        // double check the receipt is set
        if (receipt) {
          // wait for the relay and throw to outer context
          await waitForRelay(receipt as TransactionReceipt).catch(errorHandler);
        }

        // return the receipt
        return {
          receipt,
        };
      } catch (error: unknown) {
        throw new TxError(error as string | undefined, receipt);
      }
    },
    onSuccess: (data) => {
      // extract the txHash from the receipt
      const txHash =
        (data.receipt as TransactionResponse).hash ||
        (data.receipt as TransactionReceipt).transactionHash;
      // eslint-disable-next-line no-console
      console.log(`[${direction}] successful! => `, txHash);
      // set the chainID from this state
      setCTAChainId(chainId);
      // reset status on error
      setCTAStatus(false);
      // if the page is open then delete the toast else update it
      if (isCTAPageOpenRef.current) {
        // delete the toast (or change it to a success message and button to change page to CTAPages[directionString])
        deleteToast(`${txHash}`);
      } else {
        // reset now
        setCTAPage(CTAPages.Default);
        // replace the toast with a success toast
        const toastProps = {
          id: `${txHash}`,
          type: "success",
          buttonText: `View TX Receipts`,
          borderLeft: "bg-green-600",
          content: (
            <div>
              <div>{directionString} complete!</div>
            </div>
          ),
        } as ToastProps;

        // store tx2 into local context
        const associatedtx2Hash = tx2HashRef.current;

        // update the content and the callbacks
        updateToast({
          ...toastProps,
          onButtonClick: () => {
            setCTAChainId(chainId);
            setTx1(data.receipt);
            setTx1Hash(txHash);
            setTx2Hash(associatedtx2Hash || false);
            setCTAPage(
              direction === Direction.Deposit
                ? CTAPages.Deposit
                : CTAPages.Withdrawn
            );
            setIsCTAPageOpen(true);
            // mark open now
            isCTAPageOpenRef.current = true;

            // close the toast when clicked...
            return false;
          },
        });
      }

      // deposits move on from here, withdrawals will have already been moved on when they reach here
      if (
        isCTAPageOpenRef.current &&
        direction === Direction.Deposit &&
        txHash === tx1HashRef.current
      ) {
        // assets have been onchained move to the success page
        setCTAPage(CTAPages[directionString]);
      }
    },
    onError: (error: TxError) => {
      // extract the txHash from the receipt
      const txHash =
        (error.receipt as TransactionResponse).hash ||
        (error.receipt as TransactionReceipt).transactionHash;

      // eslint-disable-next-line no-console
      console.log(
        `[${direction}] errorMessage => `,
        error.message,
        " txHash => ",
        txHash
      );

      // delete the toast if the tx failed or something generic that we don't know about went wrong...
      if (
        (error.receipt as TransactionReceipt).status &&
        error.message.indexOf(`"code":"SERVER_ERROR"`) === -1 &&
        error.message.indexOf("Error: failed to meet quorum") === -1 &&
        error.message.indexOf("Error: underlying network changed") === -1
      ) {
        // check the txHash is set...
        if (txHash) {
          // delete the toast, we won't be able to reuse/await this tx - it has failed.
          deleteToast(`${txHash}`);
        }
        // reset status to clear loading states
        setCTAStatus(false);
      } else if (txHash) {
        // create a restore checkpoint (this could become a memory issue, but it should be fine to do this for a few tx's)
        const restore = () => {
          setCTAChainId(chainId);
          setTx1(error.receipt);
          setTx1Hash(txHash);
          setTx2Hash(false);
          // set the page before opening
          setCTAPage(CTAPages.Loading);
          // this page will now be showing the loading state for the current captured state
          setIsCTAPageOpen(true);
          // this second relay could also fail - we want to reoute this back to the start of the callCTA
          callBridgeCTA(error.receipt);
          // clear this restore point
          ctaErrorReset.current = undefined;
          // mark open now
          isCTAPageOpenRef.current = true;

          // we can close this when its clicked because it will be replaced with every new waitForRelay toast
          return true;
        };
        // set the restoration point
        ctaErrorReset.current = () => restore();
        // we can update the toast to an error state and allow us to recall the waitForRelay in this same context
        updateToast({
          borderLeft: "bg-red-600",
          content: (
            <div>
              <div>There was a connection error</div>
              <div className="text-sm">Reattempt the relay process.</div>
            </div>
          ),
          type: "success",
          id: `${txHash}`,
          buttonText: `Retry`,
          // this buttonClick action should also be associated with the "Try again" button in the error page
          onButtonClick: () => restore(),
        });
        // move the page if this the current tx in view
        if (txHash === tx1HashRef.current) {
          // show error modal
          setCTAPage(CTAPages.Error);
        }
      } else {
        // reset status on error
        setCTAStatus(false);
      }
    },
  });

  return callBridgeCTA;
}

export default useCallBridge;
