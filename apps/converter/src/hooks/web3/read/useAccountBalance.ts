import { L1_CHAIN_ID } from "@config/constants";
import { BigNumber, Contract } from "ethers";
import { useQuery } from "wagmi/query";
import { getFallbackProvider } from "@utils/getFallbackProvider";

function useAccountBalance(address: `0x${string}`, token: string) {
  // perform a multicall on the given network to get all token balances for user
  const {
    data: balance,
    refetch: resetBalance,
    isFetching: isFetchingBalance,
    isRefetching: isRefetchingBalance,
  } = useQuery({
    queryKey: [
      "BALANCE_FOR_ADDRESS",
      {
        address,
      },
    ],
    queryFn: async () => {
      const provider = getFallbackProvider(L1_CHAIN_ID);
      const abi = [
        {
          constant: true,
          inputs: [
            {
              name: "_owner",
              type: "address",
            },
          ],
          name: "balanceOf",
          outputs: [
            {
              name: "balance",
              type: "uint256",
            },
          ],
          payable: false,
          type: "function",
        },
      ];
      const contract = new Contract(token, abi, provider);
      const finalBalance = await contract.balanceOf(address);

      // return
      return finalBalance.toString();
    },

    // refetch every 60s or when refetched
    staleTime: 60000,
    refetchInterval: 60000,
    // background refetch stale data
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  });

  return {
    balance,
    resetBalance,
    isFetchingBalance,
    isRefetchingBalance,
  } as {
    balance: BigNumber;
    resetBalance: () => void;
    isFetchingBalance: boolean;
    isRefetchingBalance: boolean;
  };
}

export default useAccountBalance;
