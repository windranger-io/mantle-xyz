import {
  TOKEN_ABI,
  L1_BITDAO_TOKEN,
  L1_CONVERTER_CONTRACT_ADDRESS,
} from "@config/constants";
import StateContext from "@providers/stateContext";
import { parseUnits } from "ethers/lib/utils.js";
import { useCallback, useContext, useState } from "react";
import { useContractWrite } from "wagmi";

export function useCallApprove() {
  // hydrate context into state
  const { provider, amount, resetAllowance } = useContext(StateContext);

  // if we're running an approve tx, we'll track the state on approvalStatus
  const [approvalStatus, setApprovalStatus] = useState<string | boolean>(false);

  // setup a call to approve an allowance on the selected token
  const { writeAsync: writeApprove } = useContractWrite({
    address: L1_BITDAO_TOKEN.address,
    abi: TOKEN_ABI,
    functionName: "approve",
  });

  // construct a method to call and await an approval call to allocate allowance to the bridge
  const approve = useCallback(async () => {
    try {
      // mark as waiting...
      setApprovalStatus("Waiting for tx approval...");
      // perform the tx call
      const txRes = await writeApprove({
        args: [
          L1_CONVERTER_CONTRACT_ADDRESS,
          parseUnits(amount || "0", L1_BITDAO_TOKEN.decimals).toString(),
        ],
      }).catch((e) => {
        throw e;
      });
      // mark approval...
      setApprovalStatus("Tx approved, waiting for confirmation...");
      // wait for one confirmation
      await provider
        .waitForTransaction(txRes?.hash || "", 1)
        .catch((e: any) => {
          throw e;
        });
      // final update
      setApprovalStatus("Tx settled");
    } catch {
      // log the approval was cancelled
      setApprovalStatus("Approval cancelled");
    } finally {
      // call this to reset the allowance in the ui
      resetAllowance();
      // stop awaiting
      setApprovalStatus(false);
    }

    // token is now approved
    return true;
  }, [amount, provider, resetAllowance, writeApprove]);

  return {
    approvalStatus,
    approve,
  };
}

export default useCallApprove;
