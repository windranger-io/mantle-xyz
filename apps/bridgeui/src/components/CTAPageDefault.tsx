import {
  Direction,
  HARDCODED_EXPECTED_CLAIM_FEE_IN_GAS,
  CTAPages,
  Token,
} from "@config/constants";

import { useContext, useEffect, useState } from "react";
import { MdClear } from "react-icons/md";

import { Button, Typography } from "@mantle/ui";

import { goerli, useMutation } from "wagmi"; // useSigner
import { formatUnits, parseUnits } from "ethers/lib/utils.js";

import StateContext from "@providers/stateContext";
import Values from "@components/CTAPageValues";

import { ToastProps, useToast } from "@hooks/useToast";
import { useWaitForRelay } from "@hooks/useWaitForRelay";
import { timeout } from "@utils/tools";

import {
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/providers";

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

export default function CTAPageDefault({
  direction,
  selected,
  destination,
  ctaStatus,
  setCTAStatus,
  closeModal,
}: {
  direction: Direction;
  selected: Token;
  destination: Token;

  ctaStatus: string | boolean;
  setCTAStatus: (val: string | boolean) => void;

  closeModal: () => void;
}) {
  const {
    chainId,
    ctaChainId,
    destinationToken,
    destinationTokenAmount,
    actualGasFee,
    l1FeeData,
    crossChainMessenger,
    ctaErrorReset,
    l1TxHashRef,
    l2TxHashRef,
    setL1Tx,
    setL1TxHash,
    setL2TxHash,
    setCTAChainId,
    setCTAPage,
    setIsCTAPageOpen,
    isCTAPageOpenRef: isOpenRef,
  } = useContext(StateContext);

  // build toast to return to the current page
  const { updateToast, deleteToast } = useToast();

  // @TODO: we should keep track of which relays we have running
  // const [openToasts, setOpenToasts] = useState<string[]>([]);

  // waitForRelay function imported as a hook
  const waitForRelay = useWaitForRelay({
    direction,
    setCTAStatus,
  });

  // convert the enum direction to a string (but retain strict typings for Deposit | Withdraw)
  const directionString = Direction[direction] as keyof typeof Direction;

  // checkboxs need to be selected to continue
  const [chkbx1, setChkbx1] = useState(false);
  const [chkbx2, setChkbx2] = useState(false);

  // main CTA method - we keep this mutation frame open until it error's or the tx succeeds - this keeps a closure over the current state so that we can return to it (via toasts)
  const { mutate: callCTA } = useMutation({
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

        // if we've been given a receipt then the tx is already out there...
        if (!givenReceipt) {
          // for each type of interaction...
          if (chainId === 5 && selected.name === "ETH") {
            // depositETH
            receipt = await crossChainMessenger
              .depositETH(parseUnits(destinationTokenAmount, selected.decimals))
              .catch(errorHandler);
          } else if (chainId === 5) {
            // depositERC20
            receipt = await crossChainMessenger
              .depositERC20(
                selected.address,
                destination.address,
                parseUnits(destinationTokenAmount, selected.decimals)
              )
              .catch(errorHandler);
          } else if (selected.name === "ETH") {
            // withdrawETH
            receipt = await crossChainMessenger
              .withdrawETH(
                parseUnits(destinationTokenAmount, selected.decimals)
              )
              .catch(errorHandler);
          } else {
            // withdrawERC20
            receipt = await crossChainMessenger
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
          type: "onGoing",
          buttonText: `Restore loading screen`,
          borderLeft:
            ctaChainId === goerli.id ? "bg-yellow-500" : "bg-blue-600",
          content: (
            <div>
              <div>
                {ctaChainId === goerli.id ? "Deposit" : "Withdrawal"} initiated
              </div>
              <div className="text-sm">
                {ctaChainId === goerli.id
                  ? "Assets will be available on Mantle in ~10 mins"
                  : "Will be available to claim in  ~20mins"}
              </div>
            </div>
          ),
        } as ToastProps;

        // update the content and the callbacks
        updateToast({
          ...toastProps,
          onButtonClick: () => {
            setCTAChainId(chainId);
            setL1Tx(receipt);
            setL1TxHash(txHash);
            setL2TxHash(false);
            setCTAPage(CTAPages.Loading);
            setIsCTAPageOpen(true);
            // mark open now
            isOpenRef.current = true;

            // don't close the toast when clicked...
            return false;
          },
        });

        // set the l1 into storage
        setL1Tx(receipt);

        // store the hash as soon as we make the tx
        setL1TxHash(txHash);

        // setting this so that its present without the need for a tick
        l1TxHashRef.current = (txHash || "").toString();

        // action was approved now we're waiting for confirmation
        setCTAStatus("Tx approved, waiting for confirmation...");

        // move to the loading page
        setCTAPage(CTAPages.Loading);

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
      if (isOpenRef.current) {
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

        // store l2Tx into local context
        const associatedL2TxHash = l2TxHashRef.current;

        // update the content and the callbacks
        updateToast({
          ...toastProps,
          onButtonClick: () => {
            setCTAChainId(chainId);
            setL1Tx(data.receipt);
            setL1TxHash(txHash);
            setL2TxHash(associatedL2TxHash || false);
            setCTAPage(
              direction === Direction.Deposit
                ? CTAPages.Deposit
                : CTAPages.Withdrawn
            );
            setIsCTAPageOpen(true);
            // mark open now
            isOpenRef.current = true;

            // close the toast when clicked...
            return true;
          },
        });
      }

      // deposits move on from here, withdrawals will have already been moved on when they reach here
      if (
        isOpenRef.current &&
        direction === Direction.Deposit &&
        txHash === l1TxHashRef.current
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
          setL1Tx(error.receipt);
          setL1TxHash(txHash);
          setL2TxHash(false);
          // set the page before opening
          setCTAPage(CTAPages.Loading);
          // this page will now be showing the loading state for the current captured state
          setIsCTAPageOpen(true);
          // this second relay could also fail - we want to reoute this back to the start of the callCTA
          callCTA(error.receipt);
          // clear this restore point
          ctaErrorReset.current = undefined;
          // mark open now
          isOpenRef.current = true;

          // we want to close this when its clicked because it will be replaced with the waitForRelay toast
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
          type: "onGoing",
          id: `${txHash}`,
          buttonText: `Retry`,
          // this buttonClick action should also be associated with the "Try again" button in the error page
          onButtonClick: () => restore(),
        });
        // move the page if this the current tx in view
        if (txHash === l1TxHashRef.current) {
          // show error modal
          setCTAPage(CTAPages.Error);
        }
      } else {
        // reset status on error
        setCTAStatus(false);
      }
    },
  });

  // set the chainId onload
  useEffect(
    () => {
      setCTAChainId(direction === Direction.Deposit ? 5 : 5001);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // For the withdrawal direction, this needs to modified to inlcude the different l1 & l2 gasPrice and it also needs the terms and condtions to be accepted before proceeding
  return (
    <>
      <span className="flex justify-between align-middle">
        <Typography variant="modalHeading">
          Confirm {directionString}
        </Typography>
        <Typography variant="modalHeading" className="text-white pt-1">
          <MdClear onClick={closeModal} className="cursor-pointer" />
        </Typography>
      </span>
      <div>
        <Values
          label={`Amount to ${directionString.toLowerCase()}`}
          value={`${destinationTokenAmount} ${destinationToken[direction]}`}
          border
        />
        <Values
          label="Time to transfer"
          value={
            direction === Direction.Deposit ? "~10 minutes" : "~20 Minutes"
          }
          border
        />
        {/* different between chains */}
        {direction === Direction.Deposit && (
          <Values
            label="Expected gas fee"
            value={`${formatUnits(parseUnits(actualGasFee, "gwei"), 18)} ETH`}
            border={false}
          />
        )}
        {direction === Direction.Withdraw && (
          <Values
            label="Gas fee to initiate"
            value={`${formatUnits(parseUnits(actualGasFee, "gwei"), 18)} BIT`}
            border
          />
        )}
        {direction === Direction.Withdraw && (
          <Values
            label="Gas fee to complete"
            value={
              <>
                ~
                {formatUnits(
                  parseUnits(
                    l1FeeData.data?.gasPrice?.toString() || "0",
                    "wei"
                  )?.mul(HARDCODED_EXPECTED_CLAIM_FEE_IN_GAS) || "0",
                  18
                )}{" "}
                ETH
              </>
            }
            border={false}
          />
        )}
        {direction === Direction.Withdraw && (
          <div className="flex flex-row items-start gap-2 cursor-pointer my-4">
            <input
              id="checkbox-understand-1"
              type="checkbox"
              checked={chkbx1}
              onChange={(e) => {
                setChkbx1(e.currentTarget.checked);
              }}
              value=""
              className="w-4 h-4 m-[0.25rem] rounded focus:ring-blue-500/30 focus:ring-2 focus:ring-offset-gray-800 bg-gray-700 border-gray-600"
            />
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label
              htmlFor="checkbox-understand-1"
              className="ml-2 text-sm font-medium text-gray-300"
            >
              I understand it will take ~ 5 minutes until my funds are claimable
              on Goerli Testnet.
            </label>
          </div>
        )}
        {direction === Direction.Withdraw && (
          <div className="flex flex-row items-start gap-2 cursor-pointer my-4">
            <input
              id="checkbox-understand-2"
              type="checkbox"
              checked={chkbx2}
              onChange={(e) => {
                setChkbx2(e.currentTarget.checked);
              }}
              className="w-4 h-4 m-[0.25rem] rounded focus:ring-blue-500/30 focus:ring-2 focus:ring-offset-gray-800 bg-gray-700 border-gray-600"
            />
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label
              htmlFor="checkbox-understand-2"
              className="ml-2 text-sm font-medium text-gray-300"
            >
              I understand that once the funds are claimable Goerli Testnet I
              will need to send a transaction on L1 (~$ in fees) to receive the
              funds
            </label>
          </div>
        )}
      </div>

      <div>
        <Button
          size="full"
          disabled={
            !!ctaStatus ||
            (direction === Direction.Withdraw && (!chkbx1 || !chkbx2))
          }
          onClick={() => callCTA(undefined)}
        >
          {!ctaStatus ? (
            "Confirm"
          ) : (
            <div className="flex flex-row gap-4 items-center mx-auto w-fit">
              <span>
                {direction === Direction.Deposit ? "Depositing" : "Withdrawing"}{" "}
                Assets{" "}
              </span>
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
            </div>
          )}
        </Button>
      </div>
    </>
  );
}
