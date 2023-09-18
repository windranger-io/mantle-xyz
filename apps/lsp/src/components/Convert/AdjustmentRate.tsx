import { TextLoading } from "@components/Loading";
import { CHAIN_ID } from "@config/constants";
import { ContractName, contracts } from "@config/contracts";
import { T } from "@mantle/ui";
import { useAccount, useContractRead } from "wagmi";

export default function AdjustmentRate() {
  const { address } = useAccount();
  const stakingContract = contracts[CHAIN_ID][ContractName.Staking];

  const adjustment = useContractRead({
    ...stakingContract,
    functionName: "exchangeAdjustmentRate",
    enabled: Boolean(address),
    watch: false,
  });

  return (
    <div className="flex flex-row justify-between">
      <T variant="body">Adjustment rate</T>
      <T variant="body">
        {adjustment.data !== undefined ? (
          `${adjustment.data}%`
        ) : (
          <TextLoading className="text-start w-24 h-4" />
        )}
      </T>
    </div>
  );
}
