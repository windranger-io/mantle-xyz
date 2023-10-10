import { useFeeData } from "wagmi";

export default function useTxFeeEstimate(gasAmount: bigint) {
  const feeData = useFeeData();

  if (!feeData.data || gasAmount === BigInt(0)) {
    return {
      isLoading: feeData.isLoading,
      estimate: null,
    };
  }

  const { maxFeePerGas, maxPriorityFeePerGas } = feeData.data;

  if (!maxFeePerGas || !maxPriorityFeePerGas) {
    return {
      isLoading: false,
      estimate: null,
    };
  }

  return {
    isLoading: false,
    estimate: (maxFeePerGas + maxPriorityFeePerGas) * gasAmount,
  };
}
