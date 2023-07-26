import {
  L1_CHAIN_ID,
  CTAPages,
  L1_CONVERTER_CONTRACT_ABI,
  L1_CONVERTER_CONTRACT_ADDRESS,
  L1_BITDAO_TOKEN,
  ErrorMessages,
} from "@config/constants";
import {
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/providers";
import { UseMutateFunction } from "@tanstack/react-query";

import { useContext, useMemo } from "react";
import StateContext from "@providers/stateContext";

import { timeout } from "@utils/toolSet";

import { useMutation, useWalletClient } from "wagmi";
import { Contract, providers } from "ethers";
import { parseUnits } from "ethers/lib/utils.js";

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
export function useCallConvert(): UseMutateFunction<
  {
    receipt: TransactionReceipt | TransactionResponse;
  },
  TxError,
  TransactionReceipt | TransactionResponse | undefined,
  unknown
> {
  // build toast to return to the current page
  // const { updateToast, deleteToast } = useToast();

  // get l1 provider
  const walletClient = useWalletClient({
    chainId: L1_CHAIN_ID,
  });

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

  // hydrate context into state
  const {
    chainId,
    amount,
    isCTAPageOpenRef,
    ctaErrorReset,
    txHashRef,
    setCTAChainId,
    setTxHash,
    setCTAStatus,
    setCTAPage,
    setIsCTAPageOpen,
    setErrorMsg,
  } = useContext(StateContext);

  // main CTA method - we keep this mutation frame open until it error's or the tx succeeds - this keeps a closure over the current state so that we can return to it (via toasts)
  const { mutate: callConvert } = useMutation({
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
          // produce a contract for the selected contract
          const contract = new Contract(
            L1_CONVERTER_CONTRACT_ADDRESS,
            L1_CONVERTER_CONTRACT_ABI,
            layer1Signer
          );
          // return result of running migrateBIT with given amount
          receipt = await contract.migrateBIT(
            parseUnits(amount || "0", L1_BITDAO_TOKEN.decimals)
          );
        } else {
          // restore from given
          receipt = givenReceipt;
        }

        // txHash from messageLike
        const txHash =
          (receipt as TransactionReceipt).transactionHash ||
          (receipt as TransactionResponse).hash;

        // load toast as soon as the tx is approved
        // const toastProps = {
        //   id: `${txHash}`,
        //   type: "success",
        //   buttonText: `Restore loading screen`,
        //   borderLeft:
        //     ctaChainId === L1_CHAIN_ID ? "bg-yellow-500" : "bg-blue-600",
        //   content: (
        //     <div>
        //       <div>Conversion initiated</div>
        //       <div className="text-sm">Conversion will take ~5 mins</div>
        //     </div>
        //   ),
        // } as ToastProps;

        // // update the content and the callbacks
        // updateToast({
        //   ...toastProps,
        //   onButtonClick: () => {
        //     setCTAChainId(chainId);
        //     setTxHash(txHash);
        //     setCTAPage(CTAPages.Loading);
        //     setIsCTAPageOpen(true);
        //     // mark open now
        //     isCTAPageOpenRef.current = true;

        //     // close the toast when clicked...
        //     return true;
        //   },
        // });

        // store the hash as soon as we make the tx
        setTxHash(txHash);

        // setting this so that its present without the need for a tick
        txHashRef.current = (txHash || "").toString();

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
              .wait(3)
              // keep retrying till we fill the stack
              .catch(async (e) => {
                // throw server errors to the outside (we might also want to detect bad transactions here - need to check all possible error reasons)
                if (e.reason === "underlying network changed") {
                  // throw in outer context to stop the await and to move to (restorable) error state
                  throw e;
                }
                // wait for 12 seconds (1 pollInterval) before trying again
                await timeout(12000);

                // retry the wait()
                return retryWait();
              });

            return receipt;
          };

          // keep retrying until this goes through (if it fails it should only be because of network connection issues/reorgs(unlikely))...
          receipt = await retryWait().catch(errorHandler);
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
      console.log(`[Migration] successful! => `, txHash);
      // set the chainID from this state
      setCTAChainId(chainId);
      // reset status on error
      setCTAStatus(false);
      // if the page is open then delete the toast else update it
      if (isCTAPageOpenRef.current) {
        // delete the toast (or change it to a success message)
        // deleteToast(`${txHash}`);
      } else {
        // reset now
        setCTAPage(CTAPages.Default);
        // replace the toast with a success toast
        // const toastProps = {
        //   id: `${txHash}`,
        //   type: "success",
        //   buttonText: `View Receipt`,
        //   borderLeft: "bg-green-600",
        //   content: (
        //     <div>
        //       <div>Conversion complete!</div>
        //     </div>
        //   ),
        // } as ToastProps;

        // // update the content and the callbacks
        // updateToast({
        //   ...toastProps,
        //   onButtonClick: () => {
        //     setCTAChainId(chainId);
        //     // setTx1(data.receipt);
        //     setTxHash(txHash);
        //     setCTAPage(CTAPages.Converted);
        //     setIsCTAPageOpen(true);
        //     // mark open now
        //     isCTAPageOpenRef.current = true;

        //     // close the toast when clicked...
        //     return true;
        //   },
        // });
      }

      // deposits move on from here, withdrawals will have already been moved on when they reach here
      if (isCTAPageOpenRef.current && txHash === txHashRef.current) {
        // assets have been onchained move to the success page
        setCTAPage(CTAPages.Converted);
      }
    },
    onError: (error: TxError) => {
      // extract the txHash from the receipt
      const txHash =
        (error.receipt as TransactionResponse).hash ||
        (error.receipt as TransactionReceipt).transactionHash;

      // eslint-disable-next-line no-console
      console.log(
        `[Migration] errorMessage => `,
        error.message,
        " txHash => ",
        txHash
      );

      if (error.message.indexOf("code=UNPREDICTABLE_GAS_LIMIT") > -1) {
        // display error message when user doesn't have sufficient gas
        setErrorMsg(ErrorMessages.INSUFFICIENT_GAS);
        // close the dialogue
        setIsCTAPageOpen(false);
      }

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
          // deleteToast(`${txHash}`);
        }
        // reset status to clear loading states
        setCTAStatus(false);
      } else if (txHash) {
        // create a restore checkpoint (this could become a memory issue, but it should be fine to do this for a few tx's)
        const restore = () => {
          setCTAChainId(chainId);
          setTxHash(txHash);
          // set the page before opening
          setCTAPage(CTAPages.Loading);
          // this page will now be showing the loading state for the current captured state
          setIsCTAPageOpen(true);
          // this second relay could also fail - we want to reoute this back to the start of the callCTA
          callConvert(error.receipt);
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
        // updateToast({
        //   borderLeft: "bg-red-600",
        //   content: (
        //     <div>
        //       <div>There was a connection error</div>
        //       <div className="text-sm">Reattempt the conversion process.</div>
        //     </div>
        //   ),
        //   type: "success",
        //   id: `${txHash}`,
        //   buttonText: `Retry`,
        //   // this buttonClick action should also be associated with the "Try again" button in the error page
        //   onButtonClick: () => restore(),
        // });
        // move the page if this the current tx in view
        if (txHash === txHashRef.current) {
          // show error modal
          setCTAPage(CTAPages.Error);
        }
      } else {
        // reset status on error
        setCTAStatus(false);
      }
    },
  });

  return callConvert;
}

export default useCallConvert;
