import { CHAINS_FORMATTED, L2_CHAIN_ID } from "@config/constants";
import { providers } from "ethers";
import { useMemo } from "react";
import useFeeData from "./useFeeData";

function useL2FeeData() {
  const provider = useMemo(
    () =>
      new providers.JsonRpcProvider(
        CHAINS_FORMATTED[L2_CHAIN_ID].rpcUrls.public.http[0]
      ),
    []
  );

  const { feeData, refetchFeeData } = useFeeData(provider);

  return {
    l2FeeData: feeData,
    refetchL2FeeData: refetchFeeData,
  };
}

export default useL2FeeData;
