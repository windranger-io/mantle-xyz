import Loading from "@components/Loading";
import usePendingUnstakeRequests from "@hooks/useUnstakeRequests";
import { formatEther } from "ethers/lib/utils";
import ClaimAction from "./ClaimAction";

export default function UnstakeRequests() {
  const requests = usePendingUnstakeRequests();

  console.log(requests);

  if (requests.isLoading) {
    return <Loading />;
  }
  return (
    <div className="flex flex-col w-full">
      {requests.data.map((req) => {
        const canClaim =
          (req.claimState?.amountFilledWei || 0) >= req.ethAmountWei;
        return (
          <div key={req.id}>
            Request #{req.id}, mntEth: {formatEther(req.mEthLockedWei)}{" "}
            ethRequested: {formatEther(req.ethAmountWei)} finalized:{" "}
            {String(req.claimState?.isFinalized)} filled:{" "}
            {formatEther(req.claimState?.amountFilledWei || BigInt(0))}
            {canClaim && (
              <ClaimAction id={req.id} onClaimed={requests.refetch} />
            )}
          </div>
        );
      })}
    </div>
  );
}
