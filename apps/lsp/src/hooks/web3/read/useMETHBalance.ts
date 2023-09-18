import { CHAIN_ID } from "@config/constants";
import { ContractName, contracts } from "@config/contracts";
import { Address, useContractRead } from "wagmi";

export default function useMETHBalance(address: Address | undefined) {
  const methContract = contracts[CHAIN_ID][ContractName.METH];

  const { data, isError, isLoading } = useContractRead({
    ...methContract,
    functionName: "balanceOf",
    args: [address!],
    cacheOnBlock: true,
    enabled: Boolean(address),
    keepPreviousData: true,
  });

  return { data, isError, isLoading };
}
