"use client";

/* eslint-disable no-await-in-loop */

import { CTAPages, Direction } from "@config/constants";

import { Provider, TransactionReceipt } from "@ethersproject/providers";
import { MessageReceipt, MessageStatus } from "@mantleio/sdk";
import { goerli, useProvider } from "wagmi";

import { useContext, useEffect, useRef } from "react";
import StateContext from "@providers/stateContext";

import { useToast } from "@hooks/useToast";
import MantleToGoerliSVG from "@components/MantleToGoerliSVG";

// returns a promise that resolves after "ms" milliseconds
const timeout = (ms: number) =>
  new Promise((res) => {
    setTimeout(res, ms);
  });

// How long to stay inside the waitForMessageStatus while loop for
const ONE_HOUR_MS = 3600000;

// Captures a snapshot of the state and waits for the bridge message to complete on the other side
export function useWaitForRelay({
  direction,
  setCTAStatus,
}: {
  direction: Direction;
  setCTAStatus: (val: string | boolean) => void;
}) {
  const {
    crossChainMessenger,
    waitForMessageStatus,
    resetAllowance,
    resetBalances,
    setL1Tx,
    setL1TxHash,
    setL2TxHash,
    setCTAPage,
    setCTAChainId,
    setIsCTAPageOpen,
    refetchWithdrawals,
    refetchDeposits,
    isCTAPageOpenRef: isOpenRef,
    ctaPageRef,
    l1TxHashRef,
    l2TxHashRef,
  } = useContext(StateContext);

  // build toast to return to the current page
  const { updateToast, deleteToast } = useToast();

  // get L1 provider
  const provider = useProvider({ chainId: goerli.id });

  // assign to a ref so we can use the updated version inside the func
  const providerRef = useRef<Provider>();

  // wait for the message to be relayed
  const waitForRelay = async (receipt: TransactionReceipt) => {
    // extract the txHash from the receipt, we'll use to ID the associated toast
    const txHash = receipt.transactionHash;

    // once confirmed we can check that the message was bridged or we can end here and rely on the status page
    setCTAStatus("Tx settled, waiting for message propagation...");

    // hash for the transaction
    setL1TxHash(txHash);

    // set the l1TxHash directly so that its immediately available
    l1TxHashRef.current = txHash;

    // record the action transaction
    setL1Tx(receipt);

    // noop to ignore errors
    const noopHandler = () => ({});

    // Perform the action using the crossChainMessenger
    if (direction === Direction.Deposit) {
      // update the content and the callbacks
      updateToast({
        borderLeft: "bg-yellow-500",
        content: (
          <div>
            <div>Deposit initiated</div>
            <div className="text-sm">
              Assets will be available on Mantle in ~10 mins
            </div>
          </div>
        ),
        type: "onGoing",
        id: `${txHash}`,
        buttonText: `Restore loading screen`,
        onButtonClick: () => {
          setCTAChainId(5);
          setL1Tx(receipt);
          setL1TxHash(txHash);
          setL2TxHash(false);
          setCTAPage(CTAPages.Loading);
          setIsCTAPageOpen(true);
          // mark open now
          isOpenRef.current = true;

          return false;
        },
      });
      // get the new deposits
      refetchDeposits();
      // wait for this status update (we're polling the l2 here - these are usually quicker than the l2-l1 direction)
      const retryForL2 = async (): Promise<MessageReceipt> =>
        waitForMessageStatus(txHash, MessageStatus.RELAYED, {
          pollIntervalMs: 12000, // use the same block time as L1
          timeoutMs: ONE_HOUR_MS, // extreme but it will end
        }).catch(async (e) => {
          // throw server errors to the outside
          if (
            e.reason === "underlying network changed" ||
            e.reason === "failed to meet quorum"
          ) {
            // throw in outer context to stop the await and to move to error state
            throw e;
          }
          // wait for 12 seconds (1 pollInterval) before trying again
          await timeout(12000);

          // try again - this will eventually fill the stack, any serious errors should be caught and thrown
          return retryForL2();
        });
      // get the l2Tx
      const l2Tx = await retryForL2();
      // mark as relayed
      setCTAStatus("RELAYED");
      // refetch after updating
      refetchDeposits();
      // storing the l2Hash to show on confirmation page
      setL2TxHash(
        (l2Tx as MessageReceipt)?.transactionReceipt?.transactionHash
      );
      // set into ref immediately
      l2TxHashRef.current = (
        l2Tx as MessageReceipt
      )?.transactionReceipt?.transactionHash;
    } else {
      // update the content and the callbacks
      updateToast({
        borderLeft: "bg-blue-600",
        content: (
          <div>
            <div>Withdrawal initiated</div>
            <div className="text-sm">
              Will be available to claim in ~20 mins
            </div>
          </div>
        ),
        type: "onGoing",
        id: `${txHash}`,
        buttonText: `Restore loading screen`,
        onButtonClick: () => {
          setCTAChainId(5001);
          setL1Tx(receipt);
          setL1TxHash(txHash);
          setL2TxHash(false);
          setCTAPage(CTAPages.Loading);
          setIsCTAPageOpen(true);
          // mark open now
          isOpenRef.current = true;

          return false;
        },
      });

      // refetch to mark the claim available
      refetchWithdrawals();

      // record the block we start on so that we can exit the loop if we don't get a response within the 2000 block window we have
      const startBlock = await providerRef.current!.getBlockNumber();

      // manually perform the waiting procedure and call getMessage
      let status: MessageStatus = MessageStatus.UNCONFIRMED_L1_TO_L2_MESSAGE;
      let block = startBlock;
      let stopped = false;

      // loop for 2000 blocks or until stopped
      while (!stopped && block < startBlock + 2000) {
        // get the current block number (make sure we never exceed 2000 blocks)
        block = await providerRef.current!.getBlockNumber();
        // 12s is approx time it takes to mine a block
        await timeout(12000);
        // check the status now
        status = await crossChainMessenger
          .getMessageStatus(receipt)
          // eslint-disable-next-line @typescript-eslint/no-loop-func
          .catch((e) => {
            // throw server errors to the outside
            if (
              e.reason === "failed to meet quorum" &&
              e.code === "SERVER_ERROR"
            ) {
              throw e; // this will break the loop and throw in outer context
            }
            return e.reason === "underlying network changed"
              ? status
              : MessageStatus.UNCONFIRMED_L1_TO_L2_MESSAGE;
          })
          .then((val: MessageStatus) => {
            return val;
          });
        // based on the status update the states status and wait for the relayed message before setting the L1 txHash
        if (status === MessageStatus.IN_CHALLENGE_PERIOD) {
          setCTAStatus("Ready for relay, finalizing message now");
          // refetch to mark the claim available
          refetchWithdrawals();
        } else if (
          status === MessageStatus.READY_FOR_RELAY &&
          // this should prevent page from turning back after the claim has succeeded
          (ctaPageRef.current || 0) < CTAPages.Withdraw
        ) {
          // update status
          setCTAStatus(
            "In the challenge period, waiting for status READY_FOR_RELAY..."
          );
          // we should only update the toast event if the page is closed
          if (l1TxHashRef.current === txHash && !l2TxHashRef.current) {
            // refetch to mark the claim available
            refetchWithdrawals();
            // message has been relayed move to the claim page
            setCTAPage(CTAPages.Withdraw);
          }
          // update the toast
          updateToast({
            borderLeft: "bg-green-600",
            content: (
              <div className="flex flex-row items-center gap-2">
                <span>Withdrawal ready to claim</span>
                <MantleToGoerliSVG />
              </div>
            ),
            type: "onGoing",
            id: `${txHash}`,
            buttonText: `Claim`,
            onButtonClick: () => {
              setCTAChainId(5001);
              setL1Tx(receipt);
              setL1TxHash(txHash);
              setL2TxHash(false);
              setCTAPage(CTAPages.Withdraw);
              setIsCTAPageOpen(true);
              // mark open now
              isOpenRef.current = true;

              return false;
            },
          });
        } else if (status === MessageStatus.RELAYED) {
          try {
            // resolve the cross chain message
            const resolved = await crossChainMessenger.getMessageReceipt(
              receipt
            );
            // the message has been relayed and the l1 tx should be onchain
            setCTAStatus("RELAYED");
            // restore/store the l1 receipt for final screen
            setL1Tx(receipt);
            // restore/store the l1 txHash for final screen
            setL1TxHash(txHash);
            // L1 TX should now be relayed store txHash to show on txPage
            setL2TxHash(resolved.transactionReceipt.transactionHash);
            // set the current reference
            l2TxHashRef.current = resolved.transactionReceipt.transactionHash;
            // delete the toast
            deleteToast(`${txHash}`);
            // refetch the withdrawals
            refetchWithdrawals();
            // move to withdrawn page if we hit this before the withdraw page moves us on
            if (
              l1TxHashRef.current === txHash &&
              ctaPageRef.current !== CTAPages.Withdrawn
            ) {
              setCTAPage(CTAPages.Withdrawn);
            }
            // stop the loop
            stopped = true;
          } catch {
            // noop any errors - we can try again next tick
            noopHandler();
          }
        }
        // eslint-disable-next-line no-console
        // console.log({
        //   txHash,
        //   stopped,
        //   status,
        //   block,
        //   isOkay: block < startBlock + 1999,
        // });
      }
    }

    // if we got a receipt then we can reset everything and return
    if (receipt.status) {
      // call this to reset the allowance and balances in the ui
      resetAllowance();
      resetBalances();
    }

    // final approval
    setCTAStatus("Message has been relayed");

    // return the l1TxHash (so we can keep track of this operation)
    return txHash;
  };

  // update the refs so we can access them inside the loop
  useEffect(() => {
    providerRef.current = provider;
  }, [provider]);

  return waitForRelay;
}
