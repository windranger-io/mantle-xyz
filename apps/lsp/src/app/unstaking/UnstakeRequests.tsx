import Loading from "@components/Loading";
import usePendingUnstakeRequests from "@hooks/useUnstakeRequests";
import { T } from "@mantle/ui";
import { formatEthTruncated } from "@util/util";
import ClaimAction from "./ClaimAction";
import UnstakeStats from "./UnstakeStats";

export default function UnstakeRequests() {
  const requests = usePendingUnstakeRequests();
  const totalRequests = requests.data.reduce((acc, req) => {
    return acc + BigInt(req.ethAmountWei);
  }, BigInt(0));

  const totalClaimable = requests.data.reduce((acc, req) => {
    if (req.claimState?.isFinalized) {
      return acc + req.claimState.amountFilledWei;
    }
    return acc;
  }, BigInt(0));

  if (requests.isLoading) {
    return (
      <div className="max-w-[484px] w-full px-5 py-4 bg-[#0C0C0C] border border-[#1C1E20] rounded-[20px] mx-auto items-center justify-center">
        <Loading />
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
                  <ClaimAction id={req.id} onClaimed={requests.refetch} />
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
