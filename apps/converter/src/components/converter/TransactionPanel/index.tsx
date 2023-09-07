/* eslint-disable react/require-default-props */
import { useContext, useEffect, useState } from "react";

import StateContext from "@providers/stateContext";
import { Loading } from "./Loading";
import { TransactionSummary } from "./TxSummary";

export default function TransactionPanel() {
  const { client, isLoadingGasEstimate } = useContext(StateContext);

  // to avoid hydration mismatch - initialize the actual gas fee to empty string

  // set address with useState to avoid hydration errors
  const [address, setAddress] = useState<`0x${string}`>(client?.address!);

  // set wagmi address to address for ssr
  useEffect(() => {
    if (client?.address && client?.address !== address) {
      setAddress(client?.address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.address]);

  if (isLoadingGasEstimate) {
    return <Loading />;
  }

  return <TransactionSummary />;
}
