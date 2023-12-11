import React, { useContext, useMemo } from "react";
import { useQuery } from "wagmi";
import StateContext from "@providers/stateContext";

import { Button } from "@mantle/ui";

import { MessageReceipt, MessageStatus } from "@ethan-bedrock/sdk";
import { useMantleSDK } from "@providers/mantleSDKContext";

import { useCallClaim } from "@hooks/web3/bridge/write/useCallClaim";
import { Withdrawal } from "@hooks/web3/bridge/read";
import { IS_MANTLE_V2 } from "@config/constants";

export default function Status({
  transactionHash,
  tx2Hashes,
  setTx2Hashes,
  rawStatus,
  timeLeft,
}: {
  transactionHash: string;
  tx2Hashes: Record<string, string>;
  setTx2Hashes: (tx2Hashes: Record<string, string>) => void;
  rawStatus: string;
  timeLeft: number | undefined;
}) {
  const { withdrawals, withdrawalStatuses, withdrawalTx2Hashes } =
    useContext(StateContext);

  const { getMessageStatus } = useMantleSDK();

  const discover = useMemo(() => {
    return withdrawals.findIndex(
      (item) => item.transactionHash === transactionHash
    );
  }, [transactionHash, withdrawals]);

  // shallow copy if discovered
  const item = useMemo<Withdrawal | undefined>(() => {
    return discover !== -1 ? { ...withdrawals[discover] } : undefined;
  }, [discover, withdrawals]);

  // request the appropriate status information from mantle-sdk
  const {
    data: currentStatus,
    isLoading,
    refetch,
  } = useQuery<{
    status: string;
    tx: string | undefined;
  }>(
    [
      "WITHDRAWAL_STATUS",
      {
        transactionHash,
      },
    ],
    async ({
      queryKey,
    }): Promise<{
      status: string;
      tx: string | undefined;
    }> => {
      const keys = queryKey[1] as {
        transactionHash: string;
      };

      // check for status in cahce
      if (
        item &&
        withdrawalStatuses.current[keys.transactionHash] === "complete" &&
        typeof withdrawalTx2Hashes.current[keys.transactionHash] !== "undefined"
      ) {
        return {
          status: "complete",
          tx: withdrawalTx2Hashes.current[keys.transactionHash],
        };
      }

      // check for updatable status (and update)
      if (
        getMessageStatus &&
        item &&
        item.transactionHash &&
        item.status !== "Waiting" &&
        // item.status !== "Ready for Relay" && // these arn't always accurate
        item.status !== "Relayed"
      ) {
        //   we can use getMessageStatus directly and use the response to messageResponse to decide whether or not to show claim
        await (
          getMessageStatus(item?.transactionHash, {
            returnReceipt: true,
          }) as Promise<{
            status: MessageStatus;
            receipt: MessageReceipt;
          }>
        )
          .catch(() => {
            return {
              status: -1,
              receipt: null as unknown as MessageReceipt,
            };
          })
          .then((res) => {
            if (
              withdrawalStatuses.current[item.transactionHash] !== "complete" &&
              withdrawalStatuses.current[item.transactionHash] !== "Relayed"
            ) {
              // check for status
              if (res.status === MessageStatus.READY_FOR_RELAY) {
                // otherwise its still pending
                item.status = "claim";
              } else if (res.status === MessageStatus.RELAYED) {
                // do we have the transaction hash available?
                // do we want to check the tx has completed?
                item.status = "complete";
              } else if (
                res.status === MessageStatus.IN_CHALLENGE_PERIOD ||
                res.status === MessageStatus.STATE_ROOT_NOT_PUBLISHED ||
                res.status === MessageStatus.UNCONFIRMED_L1_TO_L2_MESSAGE
              ) {
                // otherwise it should be pending
                item.status = "pending";
              }
            }
            // this is only storing one value between calls cos of race - we should use a ref to store all the status values
            if (discover !== -1 && item) {
              // persist the new status
              withdrawalStatuses.current[item.transactionHash] =
                item.status || withdrawalStatuses.current[item.transactionHash];
              // persist the l1 txhash
              if (res.receipt) {
                withdrawalTx2Hashes.current[item.transactionHash] =
                  res.receipt.transactionReceipt.transactionHash;
              }
            }
          });
      }

      return {
        status:
          (item && item.status) ||
          (item && withdrawalStatuses.current[item?.transactionHash]) ||
          "",
        tx:
          (item && item?.l1_hash) ||
          (item && withdrawalTx2Hashes.current[item?.transactionHash]),
      };
    },
    {
      // cache for 5mins
      cacheTime: 300000,
      // stale after 30sec? (never stale after complete)
      staleTime:
        (item && item?.status === "Relayed") ||
        withdrawalStatuses.current[transactionHash] === "complete"
          ? Number.POSITIVE_INFINITY
          : 30000,
      // refetch after 30 secs? (never refetch when status is "complete")
      refetchInterval:
        (item && item?.status === "Relayed") ||
        withdrawalStatuses.current[transactionHash] === "complete"
          ? Number.POSITIVE_INFINITY
          : 30000,
      // background refetch stale data
      refetchOnMount: true,
      refetchOnReconnect: true,
      // if we updated this in another tab we will want to update again now
      refetchOnWindowFocus: true,
    }
  );

  // use the callClaim methodology to claim the withdrawal and update the status
  const { isLoading: isLoadingClaim, callClaim } = useCallClaim(
    transactionHash,
    false,
    false,
    (tx) => {
      // check if we already have an l1 hash in the cache
      const l1Hash = tx2Hashes[transactionHash];
      // persist the l2 txhash
      withdrawalTx2Hashes.current[transactionHash] = tx.transactionHash;
      // mark the status as complete in the local cache
      withdrawalStatuses.current[transactionHash] = "complete";
      // update the tx2Hash store with cached values (using a ref to collect these values to avoid race conditions when setting to tx2Hashes)
      if (l1Hash !== tx.transactionHash) {
        setTx2Hashes({ ...withdrawalTx2Hashes.current });
      }
      // now refetch this now
      refetch();
    }
  );

  // make sure any cached tx2's are restored from the cache
  const status = useMemo(
    () => {
      if (currentStatus?.tx) {
        // check if we already have an l1 hash in the cache
        const l1Hash = tx2Hashes[transactionHash];

        // update local ref cache - double check for completes
        withdrawalStatuses.current[transactionHash] =
          item?.l1_hash || currentStatus.tx || l1Hash
            ? "complete"
            : currentStatus.status;

        // restore the transaction hash for l1
        withdrawalTx2Hashes.current[transactionHash] =
          l1Hash || currentStatus.tx;

        // update the tx2Hash store with cached values (using a ref to collect these values to avoid race conditions when setting to tx2Hashes)
        if (
          withdrawalTx2Hashes.current &&
          l1Hash !== withdrawalTx2Hashes.current[transactionHash]
        ) {
          setTimeout(() => {
            setTx2Hashes({ ...withdrawalTx2Hashes.current });
          });
        }

        // return the withdrawalStatus
        return withdrawalStatuses.current[transactionHash];
      }
      return item?.status;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item, currentStatus, transactionHash]
  );
  const isMantleV2 = IS_MANTLE_V2;

  if (isMantleV2) {
    // 0: Waiting  1:Ready to Prove  [status=2 && time_left != 0]: In Challenge Period  [status=2 && time_left == 0] : Ready to Finalized 3:Relayed
    return (
      <div key={transactionHash}>
        {(() => {
          switch (isLoading || rawStatus) {
            case "0":
              return (
                <div className="flex flex-row gap-2 items-center">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 11 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="5.5" cy="5.50098" r="5.5" fill="#F26A1D" />
                  </svg>
                  <span>Pending</span>
                </div>
              );
            case "1":
              return (
                <div className="flex flex-row gap-2 items-center">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 11 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="5.5" cy="5.50098" r="5.5" fill="#F26A1D" />
                  </svg>
                  <span>Ready to Prove</span>
                </div>
              );
            case "2":
              if (timeLeft !== 0) {
                return (
                  <div className="flex flex-row gap-2 items-center">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 11 11"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="5.5" cy="5.50098" r="5.5" fill="#F26A1D" />
                    </svg>
                    <span>In Challenge Period</span>
                  </div>
                );
              }
              return (
                <Button
                  type="button"
                  size="regular"
                  variant="dark"
                  onClick={callClaim}
                  disabled={isLoadingClaim}
                >
                  <div className="flex flex-row gap-2 items-center">
                    <span>Claim</span>
                    {isLoadingClaim && (
                      <div role="status">
                        <svg
                          aria-hidden="true"
                          className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
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
                    )}
                  </div>
                </Button>
              );
            case "3":
              return (
                <div className="flex flex-row gap-2 items-center">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 11 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="5.5" cy="5.5" r="5.5" fill="#3EB66A" />
                  </svg>
                  <span>Complete</span>
                </div>
              );
            default:
              return (
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
              );
          }
        })()}
      </div>
    );
  }

  // 0: Waiting  1:Ready to Prove  [status=2 && time_left != 0]: In Challenge Period  [status=2 && time_left == 0] : Ready to Finalized 3:Relayed
  return (
    <div key={transactionHash}>
      {(() => {
        switch (isLoading || status) {
          case "0":
          case "pending":
          case "Waiting":
            return (
              <div className="flex flex-row gap-2 items-center">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 11 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="5.5" cy="5.50098" r="5.5" fill="#F26A1D" />
                </svg>
                <span>Pending</span>
              </div>
            );
          case "1":
          case "claim":
          case "Ready for Relay":
            return (
              <Button
                type="button"
                size="regular"
                variant="dark"
                onClick={callClaim}
                disabled={isLoadingClaim}
              >
                <div className="flex flex-row gap-2 items-center">
                  <span>Claim</span>
                  {isLoadingClaim && (
                    <div role="status">
                      <svg
                        aria-hidden="true"
                        className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
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
                  )}
                </div>
              </Button>
            );
          case "2":
          case "complete":
          case "Relayed":
            return (
              <div className="flex flex-row gap-2 items-center">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 11 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="5.5" cy="5.5" r="5.5" fill="#3EB66A" />
                </svg>
                <span>Complete</span>
              </div>
            );
          default:
            return (
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
            );
        }
      })()}
    </div>
  );
}
