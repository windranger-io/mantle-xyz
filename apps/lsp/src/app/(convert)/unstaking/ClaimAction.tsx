import Loading from "@components/Loading";
import { CHAIN_ID } from "@config/constants";
import { ContractName, contracts } from "@config/contracts";
import { Button } from "@mantle/ui";
import { useCallback, useEffect } from "react";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

export default function ClaimAction({
  id,
  onClaimed,
}: {
  id: number;
  onClaimed: () => void;
}) {
  const { address } = useAccount();

  const stakingContract = contracts[CHAIN_ID][ContractName.Staking];

  const claimPrep = usePrepareContractWrite({
    ...stakingContract,
    functionName: "claimUnstakeRequest",
    args: [BigInt(id)],
    enabled: Boolean(address),
  });

  // TODO: Error handling for claim.
  // Success toast?
  const {
    data,
    isLoading,
    write: doClaimAsync,
  } = useContractWrite(claimPrep.config);

  const { isLoading: isWaitingForTx, isSuccess: claimIsSuccess } =
    useWaitForTransaction({
      hash: data?.hash,
    });

  const claimRequest = useCallback(async () => {
    if (!doClaimAsync) {
      return;
    }
    await doClaimAsync();
  }, [doClaimAsync]);

  useEffect(() => {
    if (claimIsSuccess) {
      onClaimed();
    }
  }, [claimIsSuccess, onClaimed]);

  const showLoading = isLoading || isWaitingForTx;

  return (
    <Button
      variant="dark"
      disabled={!doClaimAsync || showLoading}
      className="flex flex-row items-center justify-center"
      onClick={() => {
        claimRequest();
      }}
    >
      Claim{" "}
      {showLoading && (
        <span className="ml-2">
          <Loading />
        </span>
      )}
    </Button>
  );
}
