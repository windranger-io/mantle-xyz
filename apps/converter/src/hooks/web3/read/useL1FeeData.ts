import { L1_CHAIN_ID } from "@config/constants";
import { useEstimateFeesPerGas } from "wagmi";

function useL1FeeData() {
  const { data: feeData, refetch: refetchFeeData } = useEstimateFeesPerGas({
    chainId: L1_CHAIN_ID,
  });

  return {
    l1FeeData: feeData,
    refetchL1FeeData: refetchFeeData,
  };
}

export default useL1FeeData;
