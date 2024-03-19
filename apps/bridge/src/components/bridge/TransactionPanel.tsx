/* eslint-disable react/require-default-props */
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import StateContext from "@providers/stateContext";

import { Typography } from "@mantle/ui";

import { Direction, L1_CHAIN_ID, L2_CHAIN_ID, Token } from "@config/constants";

import { formatUnits, parseUnits } from "ethers/lib/utils.js";
import { constants } from "ethers";
import { formatBigNumberString, localeZero, formatTime } from "@mantle/utils";
import { useIsChainID } from "@hooks/web3/read/useIsChainID";
import { useMantleSDK } from "@providers/mantleSDKContext";
import { useQuery } from "wagmi";

export default function TransactionPanel({
  direction,
  selected,
}: // destination,
{
  direction: Direction;
  selected: Token;
  // destination: Token;
}) {
  // unpack the context
  const {
    chainId,
    client,
    balances,
    allowance,
    isLoadingFeeData,
    destinationTokenAmount,
  } = useContext(StateContext);

  // use crossChainMessenger to get challengePeriod
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
      if (crossChainMessenger?.l1ChainId) {
        return crossChainMessenger?.getChallengePeriodSeconds();
      }
      return false;
    }
  );

  // ensure we don't overflow
  const fixDecimals = useCallback(
    (value: string) => {
      const split = value.split(".");

      return parseUnits(
        `${split[0]}.${(split[1] || "0").substring(
          0,
          selected?.decimals || 18
        )}`,
        selected?.decimals || 18
      );
    },
    [selected]
  );

  // only update on allowance change to maintain the correct decimals against constants if infinity
  const isAllowanceInfinity = useMemo(
    () => {
      const tokenInfinity = formatUnits(
        constants.MaxUint256,
        selected?.decimals || 18
      );
      const fullInfinity = formatUnits(constants.MaxUint256, 18);
      const fullInfinitySplit = fullInfinity.split(".");
      const fullInfinitySelectedDeci = `${fullInfinitySplit[0]}.${(
        fullInfinitySplit[1] || "0"
      ).substring(0, selected?.decimals || 18)}`;

      const allowanceCheck = formatUnits(
        fixDecimals(allowance || "0"),
        selected?.decimals || 18
      );

      return (
        tokenInfinity === allowanceCheck ||
        fullInfinitySelectedDeci === allowanceCheck
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allowance]
  );

  // only update on allowance change to maintain the correct decimals against constants if infinity
  // const isActualGasFeeInfinity = useMemo(
  //   () => {
  //     return constants.MaxUint256.eq(parseUnits(actualGasFee || "0", "gwei"));
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [actualGasFee]
  // );

  // check that we're connected to the appropriate chain
  const isLayer1ChainID = useIsChainID(L1_CHAIN_ID);
  const isMantleChainID = useIsChainID(L2_CHAIN_ID);

  // set address with useState to avoid hydration errors
  const [address, setAddress] = useState<string>(client?.address!);

  // check that the chainId is valid for the selected use-case
  const isChainID = useMemo(() => {
    return (
      (chainId === L1_CHAIN_ID && isLayer1ChainID) ||
      (chainId === L2_CHAIN_ID && isMantleChainID) ||
      !address
    );
  }, [address, chainId, isLayer1ChainID, isMantleChainID]);

  // set wagmi address to address for ssr
  useEffect(() => {
    if (client?.address && client?.address !== address) {
      setAddress(client?.address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.address]);

  return (
    (isChainID &&
      destinationTokenAmount &&
      fixDecimals(balances[selected?.address || ""] || "-1").gte(
        fixDecimals(destinationTokenAmount || "0")
      ) &&
      fixDecimals(allowance || "-1").gte(
        fixDecimals(destinationTokenAmount || "0")
      ) &&
      ((!isLoadingFeeData && (
        <div className="flex items-center justify-between" key="tx-panel-0">
          <div className="flex">
            <Typography variant="smallWidget" className="text-xs text-white/50">
              Time to transfer
            </Typography>
            <Typography
              variant="smallWidget"
              className="text-xs text-white pl-2"
            >
              {direction === Direction.Deposit
                ? `~1 minutes`
                : `~${formatTime(
                    challengePeriod && challengePeriod < 1200
                      ? 1200
                      : challengePeriod || 1200
                  )}`}{" "}
              {/* TELAPORTR takes 1-2 mins */}
            </Typography>
          </div>
          {/* Place gas rows */}
          {direction === Direction.Deposit
            ? [
                // <div
                //   key="tx-panel-1"
                //   className="flex justify-between"
                //   title={
                //     parseInt(actualGasFee || "0", 10) === 0
                //       ? "This transaction will fail, check approved allowance"
                //       : `${
                //           isActualGasFeeInfinity
                //             ? Infinity.toLocaleString()
                //             : actualGasFee || 0
                //         } GWEI`
                //   }
                // >
                //   <Typography variant="smallWidget">Gas fee</Typography>
                //   <Typography
                //     variant="smallWidget"
                //     className={
                //       parseInt(actualGasFee || "0", 10) === 0
                //         ? "text-[#E22F3D]"
                //         : "text-white"
                //     }
                //   >
                //     <>
                //       {isActualGasFeeInfinity
                //         ? Infinity.toLocaleString()
                //         : formatEther(
                //             parseUnits(actualGasFee || "0", "gwei") || "0"
                //           )}{" "}
                //       ETH
                //     </>
                //   </Typography>
                // </div>,
              ]
            : [
                // <div
                //   className="flex justify-between"
                //   key="tx-panel-1"
                //   title={
                //     parseInt(actualGasFee || "0", 10) === 0
                //       ? "This transaction will fail, withdrawal amount must not exceed your balance"
                //       : `${
                //           isActualGasFeeInfinity
                //             ? Infinity.toLocaleString()
                //             : actualGasFee || 0
                //         } GWEI`
                //   }
                // >
                //   <Typography variant="smallWidget">
                //     Gas fee to initiate
                //   </Typography>
                //   <Typography
                //     variant="smallWidget"
                //     className={
                //       parseInt(actualGasFee || "0", 10) === 0
                //         ? "text-[#E22F3D]"
                //         : "text-white"
                //     }
                //   >
                //     <>
                //       {isActualGasFeeInfinity
                //         ? Infinity.toLocaleString()
                //         : formatEther(
                //             parseUnits(actualGasFee || "0", "gwei") || "0"
                //           )}{" "}
                //       MNT
                //     </>
                //   </Typography>
                // </div>,
                // <div
                //   className="flex justify-between"
                //   key="tx-panel-2"
                //   title={
                //     parseInt(actualGasFee || "0", 10) === 0
                //       ? "This transaction will fail, withdrawal amount must not exceed your balance"
                //       : `${
                //           parseInt(actualGasFee || "0", 10) === 0
                //             ? localeZero
                //             : `~${formatUnits(
                //                 BigNumber.from(
                //                   (
                //                     l1FeeData.data?.maxFeePerGas ||
                //                     l1FeeData.data?.gasPrice ||
                //                     "0"
                //                   ).toString()
                //                 ).mul(HARDCODED_EXPECTED_CLAIM_FEE_IN_GAS) ||
                //                   "0",
                //                 "gwei"
                //               )}`
                //         } GWEI`
                //   }
                // >
                //   <Typography variant="smallWidget">
                //     Gas fee to complete
                //   </Typography>
                //   <Typography variant="smallWidget" className="text-white">
                //     {parseInt(actualGasFee || "0", 10) === 0
                //       ? localeZero
                //       : `~${formatEther(
                //           BigNumber.from(
                //             l1FeeData.data?.maxFeePerGas ||
                //               l1FeeData.data?.gasPrice ||
                //               "0"
                //           ).mul(HARDCODED_EXPECTED_CLAIM_FEE_IN_GAS) || "0"
                //         )}`}{" "}
                //     ETH
                //   </Typography>
                // </div>,
              ]}
          {/* {client?.address &&
            client?.address !== "0x" &&
            direction === Direction.Deposit && (
              <div className="flex" key="tx-panel-3">
                <Typography
                  variant="smallWidget"
                  className="text-xs text-type-muted"
                >
                  Current Balance
                </Typography>
                <Typography
                  variant="smallWidget"
                  className="text-xs text-white pl-2"
                >
                  {Number.isNaN(
                    parseFloat(balances?.[selected?.address || ""] || "")
                  )
                    ? localeZero
                    : formatBigNumberString(
                        balances?.[selected?.address || ""],
                        3,
                        true,
                        false
                      ) || localeZero}{" "}
                  {selected.symbol}
                </Typography>
              </div>
            )} */}
          {client?.address && client?.address !== "0x" && (
            <div className="flex" key="tx-panel-4">
              <Typography
                variant="smallWidget"
                className="text-xs text-white/50"
              >
                Current Allowance
              </Typography>
              <Typography
                variant="smallWidget"
                className="text-xs text-white pl-2 overflow-hidden whitespace-nowrap text-overflow-ellipsis"
              >
                {/* eslint-disable-next-line no-nested-ternary */}
                {Number.isNaN(parseFloat(allowance || ""))
                  ? localeZero
                  : isAllowanceInfinity
                  ? Infinity.toLocaleString()
                  : formatBigNumberString(allowance, 3, true, false) ||
                    localeZero}{" "}
                {selected?.symbol}
              </Typography>
            </div>
          )}
          {/* {client?.address && client?.address !== "0x" && (
            <div
              className="flex justify-between"
              key="tx-panel-5"
              title={`${
                Number.isNaN(parseFloat(destinationTokenAmount || ""))
                  ? localeZero
                  : formatBigNumberString(
                      destinationTokenAmount,
                      3,
                      true,
                      false
                    ) || localeZero
              } ${destination.symbol}`}
            >
              <Typography variant="smallWidget">You will receive</Typography>
              <Typography
                variant="smallWidget"
                className="text-white text-ellipsis w-64 whitespace-nowrap relative overflow-auto text-right"
              >
                {Number.isNaN(parseFloat(destinationTokenAmount || ""))
                  ? localeZero
                  : formatBigNumberString(
                      destinationTokenAmount,
                      3,
                      true,
                      false
                    ) || localeZero}{" "}
                {destination?.symbol}
              </Typography>
            </div>
          )} */}
        </div>
      )) || (
        <div className="flex justify-center items-center">
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
      ))) || <div />
  );
}
