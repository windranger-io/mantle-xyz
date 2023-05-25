import { L1_CHAIN_ID } from "@config/constants";
import { useProvider } from "wagmi";
import useFeeData from "./useFeeData";

function useL1FeeData() {
  const l1Provider = useProvider({ chainId: L1_CHAIN_ID });

  const { feeData, refetchFeeData } = useFeeData(l1Provider);

  return {
    l1FeeData: feeData,
    refetchL1FeeData: refetchFeeData,
  };
}

export default useL1FeeData;
