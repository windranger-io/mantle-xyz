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
