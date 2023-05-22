/* eslint-disable react/require-default-props */
import { useContext, useEffect, useMemo, useState } from "react";

import StateContext from "@providers/stateContext";

import { Typography } from "@mantle/ui";

import {
  Direction,
  HARDCODED_EXPECTED_CLAIM_FEE_IN_GAS,
  Token,
} from "@config/constants";

import { formatEther, formatUnits, parseUnits } from "ethers/lib/utils.js";
import { constants } from "ethers";
import { formatBigNumberString } from "@utils/formatStrings";
import { useIsChainID } from "@hooks/useIsChainID";

export default function TransactionPanel({
  direction,
  selected,
  destination,
}: {
  direction: Direction;
  selected: Token;
  destination: Token;
}) {
  // unpack the context
  const {
    chainId,
    client,
    balances,
    allowance,
    feeData,
    l1FeeData,
    actualGasFee,
    isLoadingFeeData,
    destinationTokenAmount,
  } = useContext(StateContext);

  // gas calcs are different for deposits/withdrawals
  const [gasRows, setGasRows] = useState<React.ReactElement[]>([]);

  // only update on allowance change to maintain the correct decimals against constants if infinity
  const isAllowanceInfinity = useMemo(
    () =>
      constants.MaxUint256.eq(
        parseUnits(allowance || "0", destination.decimals)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allowance]
  );

  // check that we're connected to the appropriate chain
  const isGoerliChainID = useIsChainID(5);
  const isMantleChainID = useIsChainID(5001);

  // set address with useState to avoid hydration errors
  const [address, setAddress] = useState<`0x${string}`>(client?.address!);

  // check that the chainId is valid for the selected use-case
  const isChainID = useMemo(() => {
    return (
      (chainId === 5 && isGoerliChainID) ||
      (chainId === 5001 && isMantleChainID) ||
      !address
    );
  }, [address, chainId, isGoerliChainID, isMantleChainID]);

  // set wagmi address to address for ssr
  useEffect(() => {
    if (client?.address && client?.address !== address) {
      setAddress(client?.address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.address]);

  // set the rows according to state
  useEffect(() => {
    if (direction === Direction.Deposit) {
      setGasRows([
        <div
          key="tx-panel-1"
          className="flex justify-between"
          title={
            parseInt(actualGasFee || "0", 10) === 0
              ? "This transaction will fail, check approved allowance"
              : `${actualGasFee || 0} GWEI`
          }
        >
          <Typography variant="smallWidget">Gas fee</Typography>
          <Typography
            variant="smallWidget"
            className={
              parseInt(actualGasFee || "0", 10) === 0
                ? "text-[#E22F3D]"
                : "text-white"
            }
          >
            <>
              {formatEther(parseUnits(actualGasFee || "0", "gwei") || "0")} ETH
            </>
          </Typography>
        </div>,
      ]);
    } else {
      setGasRows([
        <div
          className="flex justify-between"
          key="tx-panel-1"
          title={
            parseInt(actualGasFee || "0", 10) === 0
              ? "This transaction will fail, withdrawal amount must not exceed your balance"
              : `${actualGasFee || 0} GWEI`
          }
        >
          <Typography variant="smallWidget">Gas fee to initiate</Typography>
          <Typography
            variant="smallWidget"
            className={
              parseInt(actualGasFee || "0", 10) === 0
                ? "text-[#E22F3D]"
                : "text-white"
            }
          >
            <>
              {formatEther(parseUnits(actualGasFee || "0", "gwei") || "0")} BIT
            </>
          </Typography>
        </div>,
        <div
          className="flex justify-between"
          key="tx-panel-2"
          title={
            parseInt(actualGasFee || "0", 10) === 0
              ? "This transaction will fail, withdrawal amount must not exceed your balance"
              : `${
                  parseInt(actualGasFee || "0", 10) === 0
                    ? "0.0"
                    : `~${formatUnits(
                        parseUnits(
                          l1FeeData.data?.gasPrice?.toString() || "0",
                          "wei"
                        )?.mul(HARDCODED_EXPECTED_CLAIM_FEE_IN_GAS) || "0",
                        "gwei"
                      )}`
                } GWEI`
          }
        >
          <Typography variant="smallWidget">Gas fee to complete</Typography>
          <Typography
            variant="smallWidget"
            className={
              parseInt(actualGasFee || "0", 10) === 0
                ? "text-[#E22F3D]"
                : "text-white"
            }
          >
            {parseInt(actualGasFee || "0", 10) === 0
              ? "0.0"
              : `~${formatEther(
                  parseUnits(
                    l1FeeData.data?.gasPrice?.toString() || "0",
                    "wei"
                  )?.mul(HARDCODED_EXPECTED_CLAIM_FEE_IN_GAS) || "0"
                )}`}{" "}
            ETH
          </Typography>
        </div>,
      ]);
    }
  }, [
    direction,
    actualGasFee,
    feeData.data?.gasPrice,
    l1FeeData.data?.gasPrice,
  ]);

  return (
    (isChainID &&
      destinationTokenAmount &&
      parseUnits(allowance || "-1", selected.decimals).gte(
        parseUnits(destinationTokenAmount || "0", selected.decimals)
      ) &&
      ((!isLoadingFeeData && (
        <div className="space-y-3" key="tx-panel-0">
          <div className="flex justify-between">
            <Typography variant="smallWidget">Time to transfer</Typography>
            <Typography variant="smallWidget" className="text-white">
              {direction === Direction.Deposit ? `~ 10 min` : `~ 20 min`}{" "}
              {/* TELAPORTR takes 1-2 mins */}
            </Typography>
          </div>
          {gasRows}
          {client?.address && client?.address !== "0x" && (
            <div className="flex justify-between" key="tx-panel-3">
              <Typography variant="smallWidget" className="text-type-muted">
                Current Balance
              </Typography>
              <Typography variant="smallWidget" className="text-type-muted">
                {Number.isNaN(parseFloat(balances?.[selected.address] || ""))
                  ? "0.0"
                  : formatBigNumberString(balances?.[selected.address]) ||
                    "0.0"}{" "}
                {selected.symbol}
              </Typography>
            </div>
          )}
          {client?.address && client?.address !== "0x" && (
            <div className="flex justify-between" key="tx-panel-4">
              <Typography variant="smallWidget" className="text-type-muted">
                Current Allowance
              </Typography>
              <Typography variant="smallWidget" className="text-type-muted">
                {/* eslint-disable-next-line no-nested-ternary */}
                {Number.isNaN(parseFloat(allowance || ""))
                  ? "0.0"
                  : isAllowanceInfinity
                  ? Infinity.toLocaleString()
                  : formatBigNumberString(allowance) || "0.0"}{" "}
                {selected.symbol}
              </Typography>
            </div>
          )}
          {client?.address && client?.address !== "0x" && (
            <div
              className="flex justify-between"
              key="tx-panel-5"
              title={`${
                Number.isNaN(parseFloat(destinationTokenAmount || ""))
                  ? "0.0"
                  : formatBigNumberString(destinationTokenAmount) || "0.0"
              } ${destination.symbol}`}
            >
              <Typography variant="smallWidget">You will receive</Typography>
              <Typography
                variant="smallWidget"
                className="text-white text-ellipsis w-64 whitespace-nowrap relative overflow-auto text-right"
              >
                {Number.isNaN(parseFloat(destinationTokenAmount || ""))
                  ? "0.0"
                  : formatBigNumberString(destinationTokenAmount) || "0.0"}{" "}
                {destination.symbol}
              </Typography>
            </div>
          )}
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
