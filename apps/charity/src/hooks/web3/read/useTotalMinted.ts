import { CHAINS_FORMATTED, L1_CHAIN_ID } from "@config/constants";
import { BigNumber, Contract, providers } from "ethers";

import { useQuery } from "wagmi";

function useTotalMinted(address: `0x${string}`) {
  const {
    data: totalMinted,
    refetch: resetTotalMinted,
    isFetching: isFetchingTotalMinted,
    isRefetching: isRefetchingTotalMinted,
  } = useQuery<BigNumber>(
    [
      "TOTAL_MINTED_NFT",
      {
        address,
      },
    ],
    async () => {
      const provider = new providers.JsonRpcProvider(
        CHAINS_FORMATTED[L1_CHAIN_ID].rpcUrls.public.http[0]
      );
      const abi = [
        {
          constant: true,
          inputs: [],
          name: "totalMinted",
          outputs: [
            {
              name: "totalMinted",
              type: "uint256",
            },
          ],
          payable: false,
          type: "function",
        },
      ];
      const contract = new Contract(address, abi, provider);
      const totalMintedNum = await contract.totalMinted();

      // return
      return totalMintedNum.toString();
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
    totalMinted,
    resetTotalMinted,
    isFetchingTotalMinted,
    isRefetchingTotalMinted,
  } as {
    totalMinted: BigNumber;
    resetTotalMinted: () => void;
    isFetchingTotalMinted: boolean;
    isRefetchingTotalMinted: boolean;
  };
}

export default useTotalMinted;
