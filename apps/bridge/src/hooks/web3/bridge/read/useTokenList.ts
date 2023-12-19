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
      // const res = await fetch(tokenListUrl);
      // const data = await res.json();
      const data: any = {
        name: "Mantle",
        tokens: [
          {
            chainId: 11155111,
            address: "0x0000000000000000000000000000000000000000",
            name: "Ether",
            symbol: "ETH",
            decimals: 18,
            logoURI: "https://token-list.mantle.xyz/data/ETH/logo.svg",
            extensions: {
              optimismBridgeAddress:
                "0x21F308067241B2028503c07bd7cB3751FFab0Fb2",
            },
          },
          {
            chainId: 5003,
            address: "0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111",
            name: "Ether",
            symbol: "ETH",
            decimals: 18,
            logoURI: "https://token-list.mantle.xyz/data/ETH/logo.svg",
            extensions: {
              optimismBridgeAddress:
                "0x4200000000000000000000000000000000000010",
            },
          },
          {
            chainId: 11155111,
            address: "0x65e37B558F64E2Be5768DB46DF22F93d85741A9E",
            name: "Mantle",
            symbol: "MNT",
            decimals: 18,
            logoURI: "https://token-list.mantle.xyz/data/Mantle/logo.svg",
            extensions: {
              optimismBridgeAddress:
                "0x21F308067241B2028503c07bd7cB3751FFab0Fb2",
            },
          },
          {
            chainId: 5003,
            address: "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000",
            name: "Mantle",
            symbol: "MNT",
            decimals: 18,
            logoURI: "https://token-list.mantle.xyz/data/Mantle/logo.svg",
            extensions: {
              optimismBridgeAddress:
                "0x4200000000000000000000000000000000000010",
            },
          },
          {
            chainId: 11155111,
            address: "0x5Ef51dEaf9d8C33368237A848c73592a0D72b5f1",
            name: "Albert Token",
            symbol: "ATT",
            decimals: 18,
            logoURI: "https://token-list.mantle.xyz/data/Babydoge/logo.png",
            extensions: {
              optimismBridgeAddress:
                "0x21F308067241B2028503c07bd7cB3751FFab0Fb2",
            },
          },
          {
            chainId: 5003,
            address: "0x579c282aF1cD3EEbeb2b452d0de94563CDe18DCe",
            name: "Albert Token",
            symbol: "ATT",
            decimals: 18,
            logoURI: "https://token-list.mantle.xyz/data/Babydoge/logo.png",
            extensions: {
              optimismBridgeAddress:
                "0x4200000000000000000000000000000000000010",
            },
          },
        ],
        keywords: [],
        timestamp: "2023-12-11T07:37:34.239Z",
      };

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
