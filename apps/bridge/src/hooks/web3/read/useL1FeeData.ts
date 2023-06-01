import { CHAINS_FORMATTED, L1_CHAIN_ID } from "@config/constants";
import { providers } from "ethers";
import { useMemo } from "react";
import useFeeData from "./useFeeData";

function useL1FeeData() {
  // connect to goerli on public gateway - this would need to be switched
  const l1Provider = useMemo(
    () =>
      new providers.JsonRpcProvider(
        CHAINS_FORMATTED[L1_CHAIN_ID].rpcUrls.public.http[0]
      ),
    []
  );

  const { feeData, refetchFeeData } = useFeeData(l1Provider);

  return {
    l1FeeData: feeData,
    refetchL1FeeData: refetchFeeData,
  };
}

export default useL1FeeData;
