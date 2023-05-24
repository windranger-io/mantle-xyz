import { L2_CHAIN_ID } from "@config/constants";
import { useProvider } from "wagmi";
import useFeeData from "./useFeeData";

function useL2FeeData() {
  const mantleProvider = useProvider({ chainId: L2_CHAIN_ID });

  const { feeData, refetchFeeData } = useFeeData(mantleProvider);

  return {
    l2FeeData: feeData,
    refetchL2FeeData: refetchFeeData,
  };
}

export default useL2FeeData;
