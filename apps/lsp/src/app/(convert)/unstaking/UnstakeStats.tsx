import { T } from "@mantle/ui";
import { formatEthTruncated } from "@util/util";

export default function UnstakeStats({
  totalPending,
  totalClaimable,
}: {
  totalPending: bigint;
  totalClaimable: bigint;
}) {
  return (
    <div className="max-w-[484px] w-full grid relative px-5 py-4 pb-10 bg-black overflow-y-auto overflow-x-clip md:overflow-hidden border border-[#1C1E20] rounded-[20px] mx-auto">
      <div className="grid grid-cols-2">
        <div className="flex flex-col">
          <T>Pending</T>
          <T variant="buttonLarge" className="text-type-primary">
            {formatEthTruncated(totalPending)} ETH
          </T>
        </div>
        <div className="flex flex-col">
          <T>Ready to claim</T>
          <T variant="buttonLarge" className="text-type-primary">
            {formatEthTruncated(totalClaimable)} ETH
          </T>
        </div>
      </div>
    </div>
  );
}
