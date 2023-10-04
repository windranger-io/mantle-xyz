import { TextLoading } from "@components/Loading";
import { CHAIN_ID } from "@config/constants";
import { ContractName, contracts } from "@config/contracts";
import { T } from "@mantle/ui";
import { useContractRead } from "wagmi";

export default function AdjustmentRate() {
  const stakingContract = contracts[CHAIN_ID][ContractName.Staking];

  const adjustment = useContractRead({
    ...stakingContract,
    functionName: "exchangeAdjustmentRate",
    watch: false,
  });

  return (
    <div className="flex flex-row justify-between">
      <T variant="body">Adjustment rate</T>
      <T variant="body">
        {adjustment.data !== undefined ? (
          `${adjustment.data / 100}%`
        ) : (
          <TextLoading className="text-start w-24 h-4" />
        )}
      </T>
    </div>
  );
}
