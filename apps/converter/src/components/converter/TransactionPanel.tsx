/* eslint-disable react/require-default-props */
import { useContext, useEffect, useMemo, useState } from "react";

import StateContext from "@providers/stateContext";

import { Typography } from "@mantle/ui";

import { L1_BITDAO_TOKEN, L1_CHAIN_ID } from "@config/constants";

import { formatEther, parseUnits } from "ethers/lib/utils.js";
import { constants } from "ethers";
import { useIsChainID } from "@hooks/web3/read/useIsChainID";

export default function TransactionPanel() {
  // unpack the context
  const {
    chainId,
    client,
    balances,
    allowance,
    actualGasFee,
    isLoadingGasEstimate,
  } = useContext(StateContext);
  // only update on allowance change to maintain the correct decimals against constants if infinity
  // const isAllowanceInfinity = useMemo(
  //   () =>
  //     constants.MaxUint256.eq(
  //       parseUnits(allowance || "0", L1_MANTLE_TOKEN.decimals)
  //     ),
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [allowance]
  // );

  // only update on allowance change to maintain the correct decimals against constants if infinity
  const isActualGasFeeInfinity = useMemo(
    () => {
      return constants.MaxUint256.eq(parseUnits(actualGasFee || "0", "gwei"));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [actualGasFee]
  );

  // check that we're connected to the appropriate chain
  const isLayer1ChainID = useIsChainID(L1_CHAIN_ID);

  // set address with useState to avoid hydration errors
  const [address, setAddress] = useState<`0x${string}`>(client?.address!);

  // check that the chainId is valid for the L1_BITDAO_TOKEN use-case
  const isChainID = useMemo(() => {
    return (chainId === L1_CHAIN_ID && isLayer1ChainID) || !address;
  }, [address, chainId, isLayer1ChainID]);

  // set wagmi address to address for ssr
  useEffect(() => {
    if (client?.address && client?.address !== address) {
      setAddress(client?.address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.address]);

  return (
    (isChainID &&
      parseUnits(
        balances[L1_BITDAO_TOKEN.address] || "-1",
        L1_BITDAO_TOKEN.decimals
      ).gte(parseUnits("0", L1_BITDAO_TOKEN.decimals)) &&
      parseUnits(allowance || "-1", L1_BITDAO_TOKEN.decimals).gte(
        parseUnits("0", L1_BITDAO_TOKEN.decimals)
      ) &&
      ((!isLoadingGasEstimate && (
        <div className="space-y-3 pt-6" key="tx-panel-0">
          <div className="flex justify-between">
            <Typography variant="smallWidget">Conversion rate</Typography>
            <Typography variant="smallWidget" className="text-white">
              1 BIT = 1 MNT
            </Typography>
          </div>
          <div className="flex justify-between">
            <Typography variant="smallWidget">
              Approx. time to convert
            </Typography>
            <Typography variant="smallWidget" className="text-white">
              ~ 5 min
            </Typography>
          </div>
          {/* Place gas rows */}
          {[
            <div
              key="tx-panel-1"
              className="flex justify-between"
              title={
                parseInt(actualGasFee || "0", 10) === 0
                  ? "This transaction will fail, check approved allowance"
                  : `${
                      isActualGasFeeInfinity
                        ? Infinity.toLocaleString()
                        : actualGasFee || 0
                    } GWEI`
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
                  {isActualGasFeeInfinity
                    ? Infinity.toLocaleString()
                    : formatEther(
                        parseUnits(actualGasFee || "0", "gwei") || "0"
                      )}{" "}
                  ETH
                </>
              </Typography>
            </div>,
          ]}
          {/* {client?.address && client?.address !== "0x" && (
            <div className="flex justify-between" key="tx-panel-3">
              <Typography variant="smallWidget" className="text-type-muted">
                Current Balance
              </Typography>
              <Typography variant="smallWidget" className="text-type-muted">
                {Number.isNaN(
                  parseFloat(balances?.[L1_BITDAO_TOKEN.address] || "")
                )
                  ? "0.0"
                  : formatBigNumberString(
                      balances?.[L1_BITDAO_TOKEN.address]
                    ) || "0.0"}{" "}
                {L1_BITDAO_TOKEN.symbol}
              </Typography>
            </div>
          )} */}
          {/* {client?.address && client?.address !== "0x" && (
            <div className="flex justify-between" key="tx-panel-4">
              <Typography variant="smallWidget" className="text-type-muted">
                Current Allowance
              </Typography>
              <Typography variant="smallWidget" className="text-type-muted">
                {Number.isNaN(parseFloat(allowance || ""))
                  ? "0.0"
                  : isAllowanceInfinity
                  ? Infinity.toLocaleString()
                  : formatBigNumberString(allowance) || "0.0"}{" "}
                {L1_BITDAO_TOKEN.symbol}
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
      ))) || <span className="hidden" />
  );
}
