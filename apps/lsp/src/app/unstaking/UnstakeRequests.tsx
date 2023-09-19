import { useState } from "react";
import { TextLoading } from "@components/Loading";
import usePendingUnstakeRequests from "@hooks/useUnstakeRequests";
import { T } from "@mantle/ui";
import { formatEthTruncated } from "@util/util";
import ClaimAction from "./ClaimAction";
import UnstakeStats from "./UnstakeStats";

export default function UnstakeRequests() {
  const requests = usePendingUnstakeRequests();

  // This is a slightly budget version of optimistic updates. As requests data is sourced
  // from 2 different places, it's a bit tricky to get good view of the correct state of
  // requests. To ensure that we don't show requests which have already been claimed as
  // pending, we keep a local list of claimed IDs and filter them out.
  const [localClaimedIDs, setLocalClaimedIDs] = useState<number[]>([]);

  const totalRequests = requests.data.reduce((acc, req) => {
    if (localClaimedIDs.includes(req.id)) {
      return acc;
    }
    return acc + BigInt(req.ethAmountWei);
  }, BigInt(0));

  const totalClaimable = requests.data.reduce((acc, req) => {
    if (localClaimedIDs.includes(req.id)) {
      return acc;
    }
    if (!req.claimState?.isFinalized) {
      return acc;
    }
    return acc + req.claimState.amountFilledWei;
  }, BigInt(0));

  if (requests.isLoading) {
    return (
      <div className="max-w-[484px] w-full px-5 py-4 bg-[#0C0C0C] border border-[#1C1E20] rounded-[20px] mx-auto items-center justify-center">
        <div className="grid grid-cols-2">
          <div className="flex flex-col">
            <T>Pending</T>
            <TextLoading className="w-16 h-4" />
          </div>
          <div className="flex flex-col">
            <T>Ready to claim</T>
            <TextLoading className="w-16 h-4" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <UnstakeStats
        totalPending={totalRequests - totalClaimable}
        totalClaimable={totalClaimable}
      />
      <div className="max-w-[484px] w-full grid relative px-5 py-4 bg-[#0C0C0C] overflow-y-auto overflow-x-clip md:overflow-hidden border border-[#1C1E20] rounded-[20px] mx-auto -mt-8">
        {requests.data.map((req, i) => {
          // Filter out any which were already claimed.
          if (localClaimedIDs.includes(req.id)) {
            return null;
          }

          const canClaim =
            req.claimState?.isFinalized &&
            (req.claimState?.amountFilledWei || 0) >= req.ethAmountWei;
          return (
            <div key={req.id}>
              <div className="flex flex-row justify-between items-center">
                <div className="flex flex-col">
                  <T>
                    {req.requestedAt.toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </T>
                  <T variant="buttonLarge" className="text-type-primary">
                    {formatEthTruncated(req.ethAmountWei)} ETH
                  </T>
                </div>
                {canClaim ? (
                  <ClaimAction
                    id={req.id}
                    onClaimed={() => {
                      setLocalClaimedIDs([...localClaimedIDs, req.id]);
                      requests.refetch();
                    }}
                  />
                ) : (
                  <div className="flex flex-row space-x-2 items-center">
                    <div className="w-3 h-3 rounded-full bg-orange-600" />
                    <T>Pending</T>
                  </div>
                )}
              </div>
              {i !== requests.data.length - 1 && (
                <hr className="my-5 border-[#1C1E20]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
