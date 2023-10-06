import { TextLoading } from "@components/Loading";
import { CHAIN_ID } from "@config/constants";
import { ContractName, contracts } from "@config/contracts";
import { T } from "@mantle/ui";
import { formatEther } from "ethers/lib/utils";
import { useContractRead } from "wagmi";

export default function ExchangeRate() {
  const stakingContract = contracts[CHAIN_ID][ContractName.Staking];

  const exchange = useContractRead({
    ...stakingContract,
    functionName: "mETHToETH",
    args: [BigInt(1e18)],
  });

  return (
    <div className="flex flex-row justify-between">
      <T variant="body">Exchange rate</T>
      <T variant="body">
        {exchange.data ? (
          `1 mETH = ${formatEther(exchange.data).slice(0, 6)} ETH`
        ) : (
          <TextLoading className="text-start w-24 h-4" />
        )}
      </T>
    </div>
  );
}
