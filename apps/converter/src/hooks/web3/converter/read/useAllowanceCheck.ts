import {
  CHAINS_FORMATTED,
  L1_BITDAO_TOKEN,
  L1_BITDAO_TOKEN_ADDRESS,
  L1_CONVERTER_CONTRACT_ADDRESS,
  TOKEN_ABI,
} from "@config/constants";
import { Contract, BigNumberish, providers } from "ethers";

import { parseUnits, formatUnits } from "ethers/lib/utils.js";

import { useQuery } from "wagmi";

function useAllowanceCheck(
  chainId: number,
  client: { address?: `0x${string}` | undefined }
) {
  // fetch the allowance for the selected token on the selected chain
  const { data: allowance, refetch: resetAllowance } = useQuery(
    [
      "ALLOWANCE_CHECK",
      {
        address: client?.address,
        chainId,
      },
    ],
    () => {
      const provider = new providers.JsonRpcProvider(
        CHAINS_FORMATTED[chainId].rpcUrls.public.http[0]
      );
      // only run the multicall if we're connected to the correct network
      if (client?.address && client?.address !== "0x") {
        if (client.address) {
          // produce a contract for the selected contract
          const contract = new Contract(
            L1_BITDAO_TOKEN_ADDRESS,
            TOKEN_ABI,
            provider
          );
          // check the allowance the user has allocated to the bridge
          return contract
            ?.allowance(client.address, L1_CONVERTER_CONTRACT_ADDRESS)
            .catch(() => {
              // eslint-disable-next-line no-console
              // console.log("Allowance call error:", e);
              return parseUnits(allowance || "0", L1_BITDAO_TOKEN.decimals);
            })
            .then((givenAllowance: BigNumberish) => {
              const newAllowance = formatUnits(
                givenAllowance || "0",
                L1_BITDAO_TOKEN.decimals
              ).toString();
              // only trigger an update if we got a new allowance for selected token
              return newAllowance;
            });
        }
      }
      return "0";
    },
    {
      initialData: "0",
      // refetch every 60s or when refetched
      staleTime: 60000,
      refetchInterval: 60000,
      // background refetch stale data
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      refetchIntervalInBackground: true,
    }
  );

  return {
    allowance,
    resetAllowance,
  } as {
    allowance: string;
    resetAllowance: () => void;
  };
}

export default useAllowanceCheck;
