import { CHAINS_FORMATTED, L1_CHAIN_ID } from "@config/constants";
import { providers } from "ethers";
import { useMemo } from "react";
import useFeeData from "./useFeeData";

function useL1FeeData() {
  const provider = useMemo(
    () =>
      new providers.JsonRpcProvider(
        CHAINS_FORMATTED[L1_CHAIN_ID].rpcUrls.public.http[0]
      ),
    []
  );
  const { feeData, refetchFeeData } = useFeeData(provider);

  return {
    l1FeeData: feeData,
    refetchL1FeeData: refetchFeeData,
  };
}

export default useL1FeeData;
