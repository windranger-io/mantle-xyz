import Loading from "@components/Loading";
import { CHAIN_ID } from "@config/constants";
import { ContractName, contracts } from "@config/contracts";
import { Button } from "@mantle/ui";
import { useCallback } from "react";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";

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
  const { isLoading, write: doClaimAsync } = useContractWrite(claimPrep.config);

  const claimRequest = useCallback(async () => {
    if (!doClaimAsync) {
      return;
    }
    await doClaimAsync();
    onClaimed();
  }, [doClaimAsync, onClaimed]);

  return (
    <Button
      variant="dark"
      disabled={!doClaimAsync || isLoading}
      onClick={() => {
        claimRequest();
      }}
    >
      Claim {isLoading && <Loading />}
    </Button>
  );
}
