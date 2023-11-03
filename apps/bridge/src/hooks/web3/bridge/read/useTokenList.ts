import { TokenList } from "@config/constants";
import { useQuery } from "wagmi";

function useTokenList(tokenListUrl: string) {
  // query to fetch tokenList
  const {
    data: tokenList,
    refetch: refetchTokenList,
    isLoading: isLoadingTokenList,
  } = useQuery(
    ["TOKEN_LIST", { tokenListUrl }],
    async () => {
      const res = await fetch(tokenListUrl);
      const data = await res.json();
      data.tokens.push(
        {
          chainId: 5,
          address: "0x6320cD32aA674d2898A68ec82e869385Fc5f7E2f",
          name: "Wrapped liquid staked Ether 2.0",
          symbol: "wstETH",
          decimals: 18,
          logoURI: "https://token-list.mantle.xyz/data/wstETH/logo.svg",
          extensions: {
            optimismBridgeAddress: "0x2fD573Ace456904709444d04AdCa189fB19e725a",
          },
        },
        {
          chainId: 5001,
          address: "0x4CAD3137E9e6994A6E9442e723B7EEF04335C944",
          name: "Wrapped liquid staked Ether 2.0",
          symbol: "wstETH",
          decimals: 18,
          logoURI: "https://token-list.mantle.xyz/data/wstETH/logo.svg",
          extensions: {
            optimismBridgeAddress: "0x08C2EE913D3cb544D182bCC7632cB0B382A2933e",
          },
        }
      );

      return data;
    },
    { cacheTime: 300000 }
  );

  return {
    tokenList,
    refetchTokenList,
    isLoadingTokenList,
  } as {
    tokenList: TokenList;
    isLoadingTokenList: boolean;
    refetchTokenList: () => void;
  };
}

export default useTokenList;
