import { Typography } from "@mantle/ui";
import { formatEther, parseUnits } from "ethers/lib/utils.js";

type Props = {
  actualGasFee: string;
  isLoadingGasEstimate: boolean;
};

export function TransactionSummary({
  actualGasFee,
  isLoadingGasEstimate,
}: Props) {
  return (
    <div className="space-y-3 pt-6" key="tx-panel-0">
      <div className="flex justify-between">
        <Typography variant="smallWidget">Conversion rate</Typography>
        <Typography variant="smallWidget" className="text-white">
          1 BIT = 1 MNT
        </Typography>
      </div>
      <div className="flex justify-between">
        <Typography variant="smallWidget">Approx. time to convert</Typography>
        <Typography variant="smallWidget" className="text-white">
          ~ 5 min
        </Typography>
      </div>
      {/* Place gas rows */}

      {!isLoadingGasEstimate && (
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
            {formatEther(parseUnits(actualGasFee || "0", "gwei") || "0")} ETH
          </Typography>
        </div>
      )}
    </div>
  );
}
