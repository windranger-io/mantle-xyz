import { L2_CHAIN_ID } from "@config/constants";
import { useEstimateFeesPerGas } from "wagmi";

function useL2FeeData() {
  const { data: feeData, refetch: refetchFeeData } = useEstimateFeesPerGas({
    chainId: L2_CHAIN_ID,
  });

  return {
    l2FeeData: feeData,
    refetchL2FeeData: refetchFeeData,
  };
}

export default useL2FeeData;
