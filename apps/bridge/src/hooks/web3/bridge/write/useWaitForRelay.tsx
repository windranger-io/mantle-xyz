"use client";

/* eslint-disable no-await-in-loop */

import { TransactionReceipt } from "@ethersproject/providers";
import { MessageReceipt, MessageStatus } from "@mantleio/sdk";

import { useContext } from "react";
import StateContext from "@providers/stateContext";

import { timeout } from "@utils/toolSet";
import { useToast } from "@hooks/useToast";

import {
  CTAPages,
  Direction,
  IS_MANTLE_V2,
  L1_CHAIN_ID,
  L2_CHAIN_ID,
  WithdrawStatus,
} from "@config/constants";
import MantleToL1SVG from "@components/bridge/utils/MantleToL1SVG";
import { useMantleSDK } from "@providers/mantleSDKContext";
import { formatTime } from "@mantle/utils";
import { useQuery } from "wagmi";

// How long to stay inside the waitForMessageStatus while loop for
const ONE_HOUR_MS = 3600000;

// Captures a snapshot of the state and waits for the bridge message to complete on the other side
export function useWaitForRelay({ direction }: { direction: Direction }) {
  const {
    isCTAPageOpenRef: isOpenRef,
    ctaPageRef,
    tx1HashRef,
    tx2HashRef,
    setSafeChains,
    resetAllowance,
    resetBalances,
    setTx1,
    setTx1Hash,
    setTx2Hash,
    setCTAPage,
    setCTAChainId,
    setCTAStatus,
    setIsCTAPageOpen,
    refetchWithdrawals,
    refetchDeposits,
    setWithdrawStatus,
  } = useContext(StateContext);

  // import sdk comms
  const { crossChainMessenger, waitForMessageStatus, getMessageStatus } =
    useMantleSDK();

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

  // Construst the toast
  const doUpdateToast = ({
    borderLeft,
    content,
    type,
    id,
    buttonText,
    chainId,
    receipt,
    tx1Hash,
    tx2Hash,
    page = CTAPages.Loading,
    safeChains = [chainId],
  }: {
    borderLeft: string;
    content: JSX.Element;
    type: "success" | "error" | "onGoing" | undefined;
    id: string;
    buttonText: string | JSX.Element;
    chainId: number;
    receipt: TransactionReceipt;
    tx1Hash: string;
    tx2Hash: string | false;
    page: CTAPages;
    safeChains: number[];
  }) => {
    const onButtonClick = () => {
      setCTAChainId(chainId);
      setTx1(receipt);
      setTx1Hash(tx1Hash);
      setTx2Hash(tx2Hash);
      setCTAPage(page);
      setIsCTAPageOpen(true);
      // set safeChains until we complete this tx
      setSafeChains(safeChains);
      // mark open now
      isOpenRef.current = true;

      return false;
    };
    // update the content and the callbacks
    updateToast({
      id,
      type,
      content,
      borderLeft,
      buttonText,
      onButtonClick,
    });
  };

  // wait for the message to be relayed
  const waitForRelay = async (receipt: TransactionReceipt) => {
    // extract the txHash from the receipt, we'll use to ID the associated toast
    const txHash = receipt.transactionHash;

    // check the messager is available
    if (crossChainMessenger) {
      // once confirmed we can check that the message was bridged or we can end here and rely on the status page
      setCTAStatus("Tx settled, waiting for message propagation...");

      // hash for the transaction
      setTx1Hash(txHash);

      // set the tx1Hash directly so that its immediately available
      tx1HashRef.current = txHash;

      // record the action transaction
      setTx1(receipt);

      // noop to ignore errors
      const noopHandler = () => ({});

      // Perform the action using the crossChainMessenger
      if (direction === Direction.Deposit) {
        // update the content and the callbacks
        // doUpdateToast({
        //   borderLeft: "bg-yellow-500",
        //   content: (
        //     <div>
        //       <div>Deposit initiated</div>
        //       <div className="text-sm">
        //         Assets will be available on Mantle in ~12 mins
        //       </div>
        //     </div>
        //   ),
        //   type: "success",
        //   id: `${txHash}`,
        //   buttonText: `Restore loading screen`,
        //   chainId: L1_CHAIN_ID,
        //   receipt,
        //   tx1Hash: txHash,
        //   tx2Hash: false,
        //   page: CTAPages.Loading,
        //   safeChains: [L1_CHAIN_ID],
        // });
        // get the new deposits
        refetchDeposits();
        // wait for 1 min before we start checking
        await timeout(60000);
        // wait for this status update (we're polling the l2 here - these are usually quicker than the l2-l1 direction)
        const retryForL2 = async (): Promise<MessageReceipt> =>
          waitForMessageStatus!(txHash, MessageStatus.RELAYED, {
            pollIntervalMs: 36000, // wait 3 blocks between polls (default is 4000)
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
            // wait for 12 seconds (1 block) before trying again
            await timeout(12000);

            // try again - this will eventually fill the stack, any serious errors should be caught and thrown
            return retryForL2();
          });
        // get the tx2
        const tx2 = await retryForL2();
        // mark as relayed
        setCTAStatus("RELAYED");
        // refetch after updating
        refetchDeposits();
        // storing the l2Hash to show on confirmation page
        setTx2Hash(
          (tx2 as MessageReceipt)?.transactionReceipt?.transactionHash
        );
        // set into ref immediately
        tx2HashRef.current = (
          tx2 as MessageReceipt
        )?.transactionReceipt?.transactionHash;
      } else {
        if (!IS_MANTLE_V2) {
          // update the content and the callbacks
          doUpdateToast({
            borderLeft: "bg-blue-600",
            content: (
              <div>
                <div>Withdrawal initiated</div>
                <div className="text-sm">
                  Will be available to claim in{" "}
                  {`~${formatTime(
                    challengePeriod && challengePeriod < 1200
                      ? 1200
                      : challengePeriod || 1200
                  )}`}
                </div>
              </div>
            ),
            type: "success",
            id: `${txHash}`,
            buttonText: `Restore loading screen`,
            chainId: L2_CHAIN_ID,
            receipt,
            tx1Hash: txHash,
            tx2Hash: false,
            page: CTAPages.Loading,
            safeChains: [L1_CHAIN_ID, L2_CHAIN_ID],
          });
        }

        // refetch to mark the claim available
        refetchWithdrawals();

        // manually perform the waiting procedure and call getMessage
        let status: MessageStatus = MessageStatus.UNCONFIRMED_L1_TO_L2_MESSAGE;
        let iterations = 0;
        let stopped = false;

        // wait for 1 min before we start checking
        await timeout(60000);

        // loop for 2000 blocks or until stopped
        while (!stopped && iterations < 2000) {
          setSafeChains([L1_CHAIN_ID, L2_CHAIN_ID]);
          console.log("while: ", stopped, iterations);
          // 12s is approx time it takes to mine a block (wait 3 blocks before checking again)
          await timeout(36000);
          // check the status now
          console.log("checking", txHash);
          status = await getMessageStatus!(txHash)
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            .catch((e) => {
              console.log("error", e);
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
            .then((val) => {
              return val as MessageStatus;
            });
          console.log("status: ", status);
          // Mantle v2 has new Status READY_TO_PROVE
          if (status === MessageStatus.READY_TO_PROVE) {
            setCTAStatus(
              "Mantle v2 need to prove the withdraw message, waiting for status READY_TO_PROVE..."
            );
            setWithdrawStatus(WithdrawStatus.READY_TO_PROVE);
          } else if (status === MessageStatus.IN_CHALLENGE_PERIOD) {
            // based on the status update the states status and wait for the relayed message before setting the L1 txHash
            setCTAStatus(
              "In the challenge period, waiting for status READY_FOR_RELAY..."
            );
            setWithdrawStatus(WithdrawStatus.IN_CHALLENGE_PERIOD);
          } else if (
            status === MessageStatus.READY_FOR_RELAY &&
            // this should prevent page from turning back after the claim has succeeded
            (ctaPageRef.current || 0) < CTAPages.Withdraw &&
            // if we havent set the l2 ref
            !tx2HashRef.current
          ) {
            // mark as ready for relay
            setCTAStatus("Ready for relay, finalizing message now");
            // we should only update the toast event if the page is closed
            if (tx1HashRef.current === txHash) {
              // refetch to mark the claim available
              refetchWithdrawals();
              // set safeChains until we complete this tx because we'll be in a valid state on either chain
              setSafeChains([L1_CHAIN_ID, L2_CHAIN_ID]);
              // message has been relayed move to the claim page
              setCTAPage(CTAPages.Withdraw);
            }

            // update the content and the callbacks
            if (!IS_MANTLE_V2) {
              doUpdateToast({
                borderLeft: "bg-green-600",
                content: (
                  <div className="flex flex-row items-center gap-2">
                    <span>Withdrawal ready to claim</span>
                    <MantleToL1SVG />
                  </div>
                ),
                type: "success",
                id: `${txHash}`,
                buttonText: `Claim`,
                chainId: L2_CHAIN_ID,
                receipt,
                tx1Hash: txHash,
                tx2Hash: false,
                page: CTAPages.Withdraw,
                safeChains: [L1_CHAIN_ID, L2_CHAIN_ID],
              });
            }
            setWithdrawStatus(WithdrawStatus.READY_FOR_RELAY);
          } else if (status === MessageStatus.RELAYED) {
            try {
              // resolve the cross chain message
              const resolved = await crossChainMessenger.getMessageReceipt(
                receipt
              );
              // the message has been relayed and the l1 tx should be onchain
              setCTAStatus("RELAYED");
              setWithdrawStatus(WithdrawStatus.RELAYED);
              // restore/store the l1 receipt for final screen
              setTx1(receipt);
              // restore/store the l1 txHash for final screen
              setTx1Hash(txHash);
              // L1 TX should now be relayed store txHash to show on txPage
              setTx2Hash(resolved.transactionReceipt.transactionHash);
              // set the current reference
              tx2HashRef.current = resolved.transactionReceipt.transactionHash;
              // delete the toast
              deleteToast(`${txHash}`);
              // refetch the withdrawals
              refetchWithdrawals();
              // move to withdrawn page if we hit this before the withdraw page moves us on
              if (
                tx1HashRef.current === txHash &&
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
          // never exceed 2000 blocks
          iterations += 1;
          // eslint-disable-next-line no-console
          // console.log({
          //   txHash,
          //   stopped,
          //   status,
          //   iterations,
          //   isOkay: iterations < 1999,
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
    }

    // return the tx1Hash (so we can keep track of this operation)
    return txHash;
  };

  return waitForRelay;
}
