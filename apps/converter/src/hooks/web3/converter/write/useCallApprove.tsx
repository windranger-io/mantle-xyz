import {
  CTAPages,
  L1_BITDAO_TOKEN,
  L1_CONVERTER_V2_CONTRACT_ADDRESS,
  TOKEN_ABI,
} from "@config/constants";
import StateContext from "@providers/stateContext";
import { parseUnits } from "ethers/lib/utils.js";
import { useCallback, useContext, useState } from "react";
import { useWriteContract } from "wagmi";

export function useCallApprove() {
  // hydrate context into state
  const { provider, amount, resetAllowance, setCTAPage, setTxHash } =
    useContext(StateContext);

  // if we're running an approve tx, we'll track the state on approvalStatus
  const [approvalStatus, setApprovalStatus] = useState<string | boolean>(false);

  // setup a call to approve an allowance on the selected token
  const { writeContractAsync } = useWriteContract();

  // construct a method to call and await an approval call to allocate allowance to the bridge
  const approve = useCallback(
    async () => {
      try {
        // mark as waiting...
        setApprovalStatus("Waiting for tx approval...");
        // perform the tx call
        const txRes = await writeContractAsync({
          address: L1_BITDAO_TOKEN.address,
          abi: TOKEN_ABI,
          functionName: "approve",
          args: [
            L1_CONVERTER_V2_CONTRACT_ADDRESS,
            parseUnits(amount || "0", L1_BITDAO_TOKEN.decimals).toString(),
          ],
        }).catch((e) => {
          throw e;
        });
        // mark approval...
        setApprovalStatus("Tx approved, waiting for confirmation...");

        // set loading when wallet approves
        setCTAPage(CTAPages.Loading);

        // wait for one confirmation
        await provider
          .waitForTransaction(txRes || "", 1)
          .then(() => {
            setCTAPage(CTAPages.Converted);
          })
          .catch((e: any) => {
            throw e;
          });
        // final update
        setApprovalStatus("Tx settled");
        setTxHash(txRes);
      } catch {
        // log the approval was cancelled
        setApprovalStatus("Approval cancelled");
        // change the page to show error
        setCTAPage(CTAPages.Error);
      } finally {
        // call this to reset the allowance in the ui
        resetAllowance();
        // stop awaiting
        setApprovalStatus(false);
      }

      // token is now approved
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [amount, provider, resetAllowance, writeContractAsync]
  );

  return {
    approvalStatus,
    approve,
  };
}

export default useCallApprove;
