import {
  CHAINS_FORMATTED,
  L1_BITDAO_TOKEN,
  L1_BITDAO_TOKEN_ADDRESS,
  L1_CHAIN_ID,
  L1_CONVERTER_CONTRACT_ABI,
  L1_CONVERTER_CONTRACT_ADDRESS,
} from "@config/constants";
import { BigNumber, Contract, constants, providers } from "ethers";

import { formatUnits, parseUnits } from "ethers/lib/utils.js";
import { useQuery } from "wagmi/query";

function useGasEstimate(
  chainId: number,
  client: { address?: `0x${string}` | undefined },
  amount: string,
  balances: Record<string, string>,
  allowance: string
) {
  // fetch the gas estimate for the selected operation on in the selected direction
  const {
    data: actualGasFee,
    isLoading: isLoadingGasEstimate,
    refetch: resetGasEstimate,
  } = useQuery({
    queryKey: [
      "GAS_ESTIMATE",
      {
        chainId,
        address: client?.address,
        balances,
        amount,
      },
    ],
    queryFn: async () => {
      const provider = new providers.JsonRpcProvider(
        CHAINS_FORMATTED[L1_CHAIN_ID].rpcUrls.public.http[0]
      );
      // only run the call if we're connected to the correct network and user has appropriate balance
      if (
        client?.address &&
        client?.address !== "0x" &&
        amount &&
        parseFloat(amount) &&
        BigNumber.from(
          parseUnits(allowance || "0", L1_BITDAO_TOKEN.decimals)
        ).gte(parseUnits(amount, L1_BITDAO_TOKEN.decimals)) &&
        BigNumber.from(
          parseUnits(
            balances?.[L1_BITDAO_TOKEN_ADDRESS] || "0",
            L1_BITDAO_TOKEN.decimals
          )
        ).gte(parseUnits(amount, L1_BITDAO_TOKEN.decimals)) &&
        provider.network.chainId === chainId
      ) {
        try {
          // produce a contract for the selected contract
          const contract = new Contract(
            L1_CONVERTER_CONTRACT_ADDRESS,
            L1_CONVERTER_CONTRACT_ABI,
            provider
          );
          // return result of running migrateBIT with given amount
          const resp = await contract.estimateGas.migrateBIT(
            parseUnits(amount || "0", L1_BITDAO_TOKEN.decimals),
            {
              from: client.address,
            }
          );
          // return as a string
          return resp?.toString();
        } catch (e: any) {
          if (e.code === "UNPREDICTABLE_GAS_LIMIT") {
            return `${formatUnits(constants.MaxUint256.toString(), "gwei")}`;
          }
          return "0";
        }
      }
      // not estimating with a good setup show error state
      return "0";
    },

    // show infinity while loading...
    initialData: `${formatUnits(constants.MaxUint256.toString(), "gwei")}`,
    // refetch every 60s or when refetched
    staleTime: 10000,
    refetchInterval: 60000,
    // background refetch stale data
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  });

  return {
    actualGasFee,
    isLoadingGasEstimate,
    resetGasEstimate,
  } as {
    actualGasFee: string;
    isLoadingGasEstimate: boolean;
    resetGasEstimate: () => void;
  };
}

export default useGasEstimate;
