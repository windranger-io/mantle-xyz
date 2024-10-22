import { Token, TokenList } from "@config/constants";
import { useQuery } from "wagmi";

const externalTokens: Token[] = [
  {
    chainId: 1,
    address: "0xE6829d9a7eE3040e1276Fa75293Bde931859e8fA",
    name: "cmETH",
    symbol: "cmETH",
    decimals: 18,
    logoURI: "/bridge/cmeth-icon.svg",
    extensions: {
      external: {
        name: "mETH Protocol",
        url: "https://meth.mantle.xyz/bridge?token=cmeth",
      },
    },
  },
  {
    chainId: 1,
    address: "0x9F0C013016E8656bC256f948CD4B79ab25c7b94D",
    name: "COOK",
    symbol: "COOK",
    decimals: 18,
    logoURI: "/bridge/cook-icon.svg",
    extensions: {
      external: {
        name: "mETH Protocol",
        url: "https://meth.mantle.xyz/bridge?token=cook",
      },
    },
  },
  {
    chainId: 5000,
    address: "0xE6829d9a7eE3040e1276Fa75293Bde931859e8fA",
    name: "cmETH",
    symbol: "cmETH",
    decimals: 18,
    logoURI: "/bridge/cmeth-icon.svg",
    extensions: {
      external: {
        name: "mETH Protocol",
        url: "https://meth.mantle.xyz/bridge?token=cmeth",
      },
    },
  },
  {
    chainId: 5000,
    address: "0x9F0C013016E8656bC256f948CD4B79ab25c7b94D",
    name: "COOK",
    symbol: "COOK",
    decimals: 18,
    logoURI: "/bridge/cook-icon.svg",
    extensions: {
      external: {
        name: "mETH Protocol",
        url: "https://meth.mantle.xyz/bridge?token=cook",
      },
    },
  },
];

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
      const data: TokenList = await res.json();

      const updatedData = data.tokens.concat(externalTokens);

      data.tokens = updatedData;

      console.log({ tokens: data });
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
