import { TOKEN_ABI, USDT_APPROVE_ABI, Token } from "@config/constants";
import StateContext from "@providers/stateContext";
import { getAddress, parseUnits } from "ethers/lib/utils.js";
import { useCallback, useContext, useState } from "react";
import { useContractWrite } from "wagmi";

export function useCallApprove(selected: Token) {
  // hydrate context into state
  const { provider, bridgeAddress, destinationTokenAmount, resetAllowance } =
    useContext(StateContext);

  // if we're running an approve tx, we'll track the state on approvalStatus
  const [approvalStatus, setApprovalStatus] = useState<string | boolean>(false);

  // setup a call to approve an allowance on the selected token
  const { writeAsync: writeApprove } = useContractWrite({
    address:
      selected.address && (getAddress(selected.address) as `0x${string}`),
    abi: (selected.symbol === "USDT"
      ? USDT_APPROVE_ABI
      : TOKEN_ABI) as typeof TOKEN_ABI,
    functionName: "approve",
  });

  // construct a method to call and await an approval call to allocate allowance to the bridge
  const approve = useCallback(
    async (overwriteAmount?: string) => {
      try {
        // mark as waiting...
        setApprovalStatus("Waiting for tx approval...");
        // perform the tx call
        const txRes = await writeApprove?.({
          args: [
            bridgeAddress as `0x${string}`,
            BigInt(
              parseUnits(
                overwriteAmount || destinationTokenAmount || "1",
                selected.decimals
              ).toString()
            ),
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
        console.log("reseting allowance");
        await resetAllowance();
        console.log("reset allowance done");

        // stop awaiting
        setApprovalStatus(false);
      }

      // token is now approved
      return true;
    },
    [
      bridgeAddress,
      destinationTokenAmount,
      provider,
      selected.decimals,
      resetAllowance,
      writeApprove,
    ]
  );

  return {
    approvalStatus,
    approve,
  };
}

export default useCallApprove;
