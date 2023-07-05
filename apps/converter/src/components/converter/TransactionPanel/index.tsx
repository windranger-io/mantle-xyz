/* eslint-disable react/require-default-props */
import { useContext, useEffect, useMemo, useState } from "react";
import { constants } from "ethers";
import { parseUnits } from "ethers/lib/utils.js";

import StateContext from "@providers/stateContext";
import { Loading } from "./Loading";
import { TransactionSummary } from "./TxSummary";

export default function TransactionPanel() {
  const {
    client,
    actualGasFee: actualGasFeeState,
    isLoadingGasEstimate,
  } = useContext(StateContext);

  const [actualGasFee, setActualGasFee] = useState<string>("");
  // to avoid hydration mismatch - initialize the actual gas fee to empty string
  useEffect(() => {
    setActualGasFee(actualGasFeeState);
  }, [actualGasFeeState]);

  // only update on allowance change to maintain the correct decimals against constants if infinity
  const isActualGasFeeInfinity = useMemo(
    () => {
      return constants.MaxUint256.eq(parseUnits(actualGasFee || "0", "gwei"));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [actualGasFee]
  );

  // set address with useState to avoid hydration errors
  const [address, setAddress] = useState<`0x${string}`>(client?.address!);

  // set wagmi address to address for ssr
  useEffect(() => {
    if (client?.address && client?.address !== address) {
      setAddress(client?.address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.address]);

  if (isActualGasFeeInfinity) {
    return <Loading />;
  }

  return (
    <TransactionSummary
      actualGasFee={actualGasFee}
      isLoadingGasEstimate={isLoadingGasEstimate}
    />
  );
}
