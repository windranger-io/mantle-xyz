import { BridgeList } from "@config/constants";
import { useQuery } from "wagmi";

function useBridgeList(bridgeListUrl: string) {
  // query to fetch tokenList
  const {
    data: bridgeList,
    refetch: refetchBridgeList,
    isLoading: isLoadingBridgeList,
  } = useQuery(
    ["BRIDGE_LIST", { bridgeListUrl }],
    async () => {
      const res = await fetch(bridgeListUrl);
      const data = await res.json();

      return data;
    },
    { cacheTime: 300000 }
  );

  return {
    bridgeList,
    refetchBridgeList,
    isLoadingBridgeList,
  } as {
    bridgeList: BridgeList;
    refetchBridgeList: () => void;
    isLoadingBridgeList: boolean;
  };
}

export default useBridgeList;
