import { useMemo } from "react";
import { Typography } from "@mantle/ui";
import { formatEther, parseUnits } from "ethers/lib/utils.js";
import { constants } from "ethers";

type Props = {
  actualGasFee: string;
};

export function TransactionSummary({ actualGasFee }: Props) {
  // only update on allowance change to maintain the correct decimals against constants if infinity
  const isActualGasFeeInfinity = useMemo(
    () => {
      return constants.MaxUint256.eq(parseUnits(actualGasFee || "0", "gwei"));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [actualGasFee]
  );

  return (
    <div className="space-y-3 pt-6" key="tx-panel-0">
      <div className="flex justify-between">
        <Typography variant="smallWidget">Migration rate</Typography>
        <Typography variant="smallWidget" className="text-white">
          1 BIT = 1 MNT
        </Typography>
      </div>
      {/* <div className="flex justify-between">
        <Typography variant="smallWidget">Approx. time to migrate</Typography>
        <Typography variant="smallWidget" className="text-white">
          ~ 5 min
        </Typography>
      </div> */}
      {/* Place gas rows */}
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
          {isActualGasFeeInfinity
            ? Infinity.toLocaleString()
            : formatEther(parseUnits(actualGasFee || "0", "gwei") || "0")}{" "}
          ETH
        </Typography>
      </div>
    </div>
  );
}
