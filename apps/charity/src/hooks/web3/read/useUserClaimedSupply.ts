import { CHAINS_FORMATTED, L1_CHAIN_ID } from "@config/constants";
import { BigNumber, Contract, providers } from "ethers";

import { useQuery } from "wagmi";

function useUserClaimedSupply(
  address: `0x${string}`,
  conditionId: BigNumber | undefined,
  userWalletAddress: `0x${string}` | undefined
) {
  const {
    data: userClaimedAmount,
    refetch: resetUserClaimedAmount,
    isFetching: isFetchingUserClaimedAmount,
    isRefetching: isRefetchingUserClaimedAmount,
  } = useQuery<BigNumber>(
    [
      "USER_MINTED_SUPPLY",
      {
        address,
        conditionId,
        userWalletAddress,
      },
    ],
    async () => {
      const provider = new providers.JsonRpcProvider(
        CHAINS_FORMATTED[L1_CHAIN_ID].rpcUrls.public.http[0]
      );
      const abi = [
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_conditionId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "_claimer",
              type: "address",
            },
          ],
          name: "getSupplyClaimedByWallet",
          outputs: [
            {
              internalType: "uint256",
              name: "supplyClaimedByWallet",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ];
      const contract = new Contract(address, abi, provider);
      const userClaimedAmt = await contract.getSupplyClaimedByWallet(
        conditionId,
        userWalletAddress
      );

      return userClaimedAmt.toNumber();
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
    userClaimedAmount,
    resetUserClaimedAmount,
    isFetchingUserClaimedAmount,
    isRefetchingUserClaimedAmount,
  } as {
    userClaimedAmount: BigNumber;
    resetUserClaimedAmount: () => void;
    isFetchingUserClaimedAmount: boolean;
    isRefetchingUserClaimedAmount: boolean;
  };
}

export default useUserClaimedSupply;
