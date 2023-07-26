import { L2_CHAIN_ID } from "@config/constants";
import { usePublicClient } from "wagmi";
import { providers } from "ethers";
import { useMemo } from "react";
import useFeeData from "./useFeeData";

function useL2FeeData() {
  const publicClient = usePublicClient({ chainId: L2_CHAIN_ID });

  // create an ethers provider from the publicClient
  const mantleProvider = useMemo(() => {
    const { chain, transport } = publicClient;
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    };
    if (transport.type === "fallback")
      return new providers.FallbackProvider(
        (transport.transports as { value: { url: string } }[]).map(
          ({ value }) => new providers.JsonRpcProvider(value?.url, network)
        )
      );
    return new providers.JsonRpcProvider(transport.url, network);
  }, [publicClient]);

  const { feeData, refetchFeeData } = useFeeData(mantleProvider);

  return {
    l2FeeData: feeData,
    refetchL2FeeData: refetchFeeData,
  };
}

export default useL2FeeData;
