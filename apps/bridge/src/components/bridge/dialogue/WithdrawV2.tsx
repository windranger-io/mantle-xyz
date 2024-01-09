import {
  Direction,
  Token,
  L1_CHAIN_ID,
  L2_CHAIN_ID,
  CHAINS_FORMATTED,
  WithdrawStatus,
  CHAINS,
} from "@config/constants";
import TxLink from "@components/bridge/utils/TxLink";
import { useContext, useEffect, useState } from "react";
import StateContext from "@providers/stateContext";

import { useCallWithdraw } from "@hooks/web3/bridge/write/useCallWithdraw";
import { useCallProve } from "@hooks/web3/bridge/write/useCallProve";

import { Button, Typography } from "@mantle/ui";
import { MdClear } from "react-icons/md";
import { useMantleSDK } from "@providers/mantleSDKContext";
import { formatTime } from "@mantle/utils";
import { useQuery } from "wagmi";
import { useCallClaim } from "@hooks/web3/bridge/write/useCallClaim";
import useIsChainID from "@hooks/web3/read/useIsChainID";
import { useSwitchToNetwork } from "@hooks/web3/write/useSwitchToNetwork";
import { MessageStatus } from "@ethan-bedrock/sdk";
import { IconLoading } from "../Loading";
import { IconCheck } from "../Check";

function No({ n }: { n: string }) {
  return (
    <div className="rounded-full bg-[#949d9e] w-6 h-6 flex items-center justify-center mr-4">
      {n}
    </div>
  );
}

function DottedLine() {
  return (
    <div className="ml-[26px]">
      <div className="rounded-full bg-gray-100 h-[3px] w-[3px] mb-2" />
      <div className="rounded-full bg-gray-100 h-[3px] w-[3px]" />
    </div>
  );
}

export default function Default({
  direction,
  selected,
  destination,
  ctaStatus,
  closeModal,
}: {
  direction: Direction;
  selected: Token;
  destination: Token;
  ctaStatus: string | boolean;
  closeModal: () => void;
}) {
  const {
    destinationTokenAmount,
    setCTAChainId,
    withdrawStatus,
    tx1,
    tx1Hash,
    withdrawHash,
    setWithdrawHash,
    setCTAStatus,
    setWithdrawStatus,
    setSafeChains,
  } = useContext(StateContext);
  const isLayer1ChainID = useIsChainID(L1_CHAIN_ID);
  const { switchToNetwork } = useSwitchToNetwork();

  // @TODO: we should keep track of which relays we have running
  // const [openToasts, setOpenToasts] = useState<string[]>([]);

  // use crossChainMessenger to get challengePeriod
  const { crossChainMessenger } = useMantleSDK();
  const [proveStatusLoading, setProveStatusLoading] = useState(false);
  const [claimStatusLoading, setClaimStatusLoading] = useState(false);

  // const [isPollingEnabled, setIsPollingEnabled] = useState(true);

  useQuery(
    ["withdrawStatus", tx1, tx1Hash],
    async () => {
      if (!tx1 || !tx1Hash) return null;
      // const status = await getMessageStatus(tx1);
      const { status } = await fetch(
        `/api/getMessageStatus?txhash=${tx1Hash}`
      ).then((_res) => _res.json());
      console.log("message status: ", status);
      if (status === MessageStatus.READY_TO_PROVE) {
        setSafeChains([L1_CHAIN_ID, L2_CHAIN_ID]);
        setCTAStatus(
          "Mantle v2 need to prove the withdraw message, waiting for status READY_TO_PROVE..."
        );
        setWithdrawStatus(WithdrawStatus.READY_TO_PROVE);
      } else if (status === MessageStatus.IN_CHALLENGE_PERIOD) {
        setProveStatusLoading(false);
        // based on the status update the states status and wait for the relayed message before setting the L1 txHash
        setCTAStatus(
          "In the challenge period, waiting for status READY_FOR_RELAY..."
        );
        setWithdrawStatus(WithdrawStatus.IN_CHALLENGE_PERIOD);
      } else if (status === MessageStatus.READY_FOR_RELAY) {
        // mark as ready for relay
        setCTAStatus("Ready for relay, finalizing message now");
        setWithdrawStatus(WithdrawStatus.READY_FOR_RELAY);
      } else if (status === MessageStatus.RELAYED) {
        setClaimStatusLoading(false);
        // the message has been relayed and the l1 tx should be onchain
        setCTAStatus("RELAYED");
        setWithdrawStatus(WithdrawStatus.RELAYED);
      }
      return status;
    },
    {
      enabled: true,
      refetchInterval: 10000,
    }
  );

  // const handleTogglePolling = () => {
  //   setIsPollingEnabled(!isPollingEnabled);
  // };

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

  // only update on allowance change to maintain the correct decimals against constants if infinity
  // const isActualGasFeeInfinity = useMemo(
  //   () => {
  //     return constants.MaxUint256.eq(parseUnits(actualGasFee || "0", "gwei"));
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [actualGasFee]
  // );

  // convert the enum direction to a string (but retain strict typings for Deposit | Withdraw)
  const directionString = Direction[direction] as keyof typeof Direction;

  // checkboxs need to be selected to continue
  const [chkbx1, setChkbx1] = useState(false);
  const [chkbx2, setChkbx2] = useState(false);

  // use the callCTA method...
  const callCTA = useCallWithdraw(selected, destination);
  const { callProve } = useCallProve(tx1Hash, false, false, (tx) => {
    setWithdrawHash({
      ...withdrawHash,
      prove: tx?.transactionHash || "",
    });
  });

  const { callClaim } = useCallClaim(tx1Hash, false, true, (tx) => {
    setWithdrawHash({
      ...withdrawHash,
      claim: tx?.transactionHash || "",
    });
  });

  // const ONE_HOUR_MS = 3600000;

  // const waitForMessageStatus = async () => {
  //   try {
  //     await waitForMessageStatus(tx1, MessageStatus.READY_TO_PROVE, {
  //       pollIntervalMs: 36000, // wait 3 blocks between polls (default is 4000)
  //       timeoutMs: ONE_HOUR_MS, // extreme but it will end
  //     });
  //   } catch (error) {
  //     console.log("error:", error);
  //   }
  // };

  // set the chainId onload
  useEffect(
    () => {
      setCTAChainId(
        direction === Direction.Deposit ? L1_CHAIN_ID : L2_CHAIN_ID
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const submitWithdraw = async () => {
    if (withdrawStatus === WithdrawStatus.INIT) {
      callCTA(undefined);
    } else if (withdrawStatus === WithdrawStatus.READY_TO_PROVE) {
      setProveStatusLoading(true);
      callProve();
    } else if (withdrawStatus === WithdrawStatus.READY_FOR_RELAY) {
      setClaimStatusLoading(true);
      callClaim();
    }
  };

  // For the withdrawal direction, this needs to modified to inlcude the different l1 & l2 gasPrice and it also needs the terms and condtions to be accepted before proceeding
  return (
    <>
      <span className="flex justify-between align-middle">
        <Typography variant="modalHeading">Withdrawal</Typography>
        <Typography variant="modalHeading" className="text-white pt-1">
          <MdClear onClick={closeModal} className="cursor-pointer" />
        </Typography>
      </span>
      <div>
        <div className="flex flex-col">
          <div className="text-type-secondary">
            Amount to {directionString.toLowerCase()}
          </div>
          <div className="text-xl text-white">
            {destinationTokenAmount} {destination?.symbol}
          </div>
        </div>
        <div>
          <div
            className={`flex items-center justify-between rounded-full px-4 py-2 ${
              withdrawStatus === WithdrawStatus.INIT && "bg-slate-500/[.6]"
            }`}
          >
            <div className="flex items-center">
              {withdrawStatus > WithdrawStatus.INIT ? (
                <IconCheck className="mr-4" />
              ) : (
                <No n="1" />
              )}
              <span>Initiate withdrawal</span>
              {withdrawStatus === WithdrawStatus.INIT && ctaStatus && (
                <IconLoading />
              )}
            </div>
            {withdrawHash.init && (
              <TxLink
                chainId={L2_CHAIN_ID}
                txHash={withdrawHash.init}
                className=""
                asHash
              />
            )}
          </div>
          <DottedLine />
          <div
            className={`flex items-center rounded-full px-4 py-2 ${
              withdrawStatus === WithdrawStatus.SENDING_TX &&
              "bg-slate-500/[.6]"
            }`}
          >
            {withdrawStatus > WithdrawStatus.SENDING_TX ? (
              <IconCheck className="mr-4" />
            ) : (
              <No n="2" />
            )}
            <span>Wait ~30 minutes</span>
            {withdrawStatus === WithdrawStatus.SENDING_TX && <IconLoading />}
          </div>
          <DottedLine />
          <div
            className={`flex items-center justify-between rounded-full px-4 py-2 ${
              withdrawStatus === WithdrawStatus.READY_TO_PROVE &&
              "bg-slate-500/[.6]"
            }`}
          >
            <div className="flex items-center">
              {withdrawStatus > WithdrawStatus.READY_TO_PROVE ? (
                <IconCheck className="mr-4" />
              ) : (
                <No n="3" />
              )}
              <span>Prove withdrawal</span>
              {withdrawStatus === WithdrawStatus.READY_TO_PROVE &&
                proveStatusLoading && <IconLoading />}
            </div>
            {withdrawHash.prove && !proveStatusLoading && (
              <TxLink
                chainId={L1_CHAIN_ID}
                txHash={withdrawHash.prove}
                className=""
                asHash
              />
            )}
          </div>
          <DottedLine />
          <div
            className={`flex items-center rounded-full px-4 py-2 ${
              withdrawStatus === WithdrawStatus.IN_CHALLENGE_PERIOD &&
              "bg-slate-500/[.6]"
            }`}
          >
            {withdrawStatus > WithdrawStatus.IN_CHALLENGE_PERIOD ? (
              <IconCheck className="mr-4" />
            ) : (
              <No n="4" />
            )}
            <span>Wait 30 minutes</span>
            {withdrawStatus === WithdrawStatus.IN_CHALLENGE_PERIOD && (
              <IconLoading />
            )}
          </div>
          <DottedLine />
          <div
            className={`flex items-center justify-between rounded-full px-4 py-2 ${
              withdrawStatus === WithdrawStatus.READY_FOR_RELAY &&
              "bg-slate-500/[.6]"
            }`}
          >
            <div className="flex items-center">
              {withdrawStatus > WithdrawStatus.READY_FOR_RELAY ? (
                <IconCheck className="mr-4" />
              ) : (
                <No n="5" />
              )}
              <span>Claim withdrawal</span>
              {withdrawStatus === WithdrawStatus.READY_FOR_RELAY &&
                claimStatusLoading && <IconLoading />}
            </div>
            {withdrawHash.claim && !claimStatusLoading && (
              <TxLink
                chainId={L1_CHAIN_ID}
                txHash={withdrawHash.claim}
                className=""
                asHash
              />
            )}
          </div>
        </div>
        {withdrawStatus <= WithdrawStatus.INIT && (
          <>
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
                I understand it will take
                {` ~${formatTime(
                  challengePeriod && challengePeriod < 1200
                    ? 1200
                    : challengePeriod || 1200
                )}`}{" "}
                until my funds are claimable on{" "}
                {CHAINS_FORMATTED[L1_CHAIN_ID].name}.
              </label>
            </div>
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
                I understand that once the funds are claimable on{" "}
                {CHAINS_FORMATTED[L1_CHAIN_ID].name}, I will need to send a
                second transaction on L1 (~$ in fees) to receive the funds
              </label>
            </div>
          </>
        )}
      </div>
      {/* <Button
        size="full"
        onClick={() => {
          callProve();
        }}
      >
        prove
      </Button> */}

      <div>
        {!isLayer1ChainID && withdrawStatus > WithdrawStatus.INIT ? (
          <Button size="full" onClick={() => switchToNetwork(L1_CHAIN_ID)}>
            Switch to {CHAINS[L1_CHAIN_ID].chainName}
          </Button>
        ) : (
          <Button
            size="full"
            disabled={
              (withdrawStatus === WithdrawStatus.INIT && !!ctaStatus) ||
              withdrawStatus === WithdrawStatus.SENDING_TX ||
              (withdrawStatus === WithdrawStatus.READY_TO_PROVE &&
                proveStatusLoading) ||
              withdrawStatus === WithdrawStatus.IN_CHALLENGE_PERIOD ||
              (withdrawStatus === WithdrawStatus.READY_FOR_RELAY &&
                claimStatusLoading) ||
              withdrawStatus === WithdrawStatus.RELAYED ||
              !chkbx1 ||
              !chkbx2
            }
            onClick={submitWithdraw}
          >
            {withdrawStatus === WithdrawStatus.INIT &&
              !ctaStatus &&
              "Confirm Withdraw"}
            {withdrawStatus === WithdrawStatus.INIT && !!ctaStatus && (
              <div className="flex flex-row gap-4 items-center mx-auto w-fit">
                <span>Withdrawing Assets </span>
                <IconLoading className="w-8 h-8" />
              </div>
            )}
            {withdrawStatus === WithdrawStatus.SENDING_TX && (
              <div className="flex flex-row gap-4 items-center mx-auto w-fit">
                <span>Waiting</span>
              </div>
            )}
            {withdrawStatus === WithdrawStatus.READY_TO_PROVE &&
              !proveStatusLoading &&
              "Submit Prove"}
            {withdrawStatus === WithdrawStatus.READY_TO_PROVE &&
              proveStatusLoading && (
                <div className="flex flex-row gap-4 items-center mx-auto w-fit">
                  <span>Submitting Prove </span>
                  <IconLoading className="w-8 h-8" />
                </div>
              )}
            {withdrawStatus === WithdrawStatus.IN_CHALLENGE_PERIOD && (
              <div className="flex flex-row gap-4 items-center mx-auto w-fit">
                <span>Waiting Challenge Period </span>
              </div>
            )}
            {withdrawStatus === WithdrawStatus.READY_FOR_RELAY &&
              !claimStatusLoading &&
              "claim"}
            {withdrawStatus === WithdrawStatus.READY_FOR_RELAY &&
              claimStatusLoading && (
                <div className="flex flex-row gap-4 items-center mx-auto w-fit">
                  <span>Claiming </span>
                  <IconLoading className="w-8 h-8" />
                </div>
              )}
            {withdrawStatus === WithdrawStatus.RELAYED &&
              "Complete Withdrawal🎉"}
          </Button>
        )}
      </div>
    </>
  );
}
