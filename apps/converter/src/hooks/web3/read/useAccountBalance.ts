import { BigNumber, Contract } from "ethers";

import { useProvider, useQuery } from "wagmi";

function useAccountBalance(address: `0x${string}`, token: string) {
  // as connected
  const provider = useProvider();
  // perform a multicall on the given network to get all token balances for user
  const {
    data: balance,
    refetch: resetBalance,
    isFetching: isFetchingBalance,
    isRefetching: isRefetchingBalance,
  } = useQuery<BigNumber>(
    [
      "BALANCE_FOR_ADDRESS",
      {
        address,
        provider: provider?.network.name,
      },
    ],
    async () => {
      const abi = [
        "function balanceOf(address account) external view returns (uint256)",
      ];
      const contract = new Contract(token, abi, provider);
      const finalBalance = await contract.balanceOf(address);

      // return
      return finalBalance;
    },
    {
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
