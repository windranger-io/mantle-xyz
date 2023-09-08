import StakeToggle, { Mode } from "@components/StakeToggle";
import TokenDirection from "@components/TokenDirection";

export default function Staking() {
  return (
    <div className="max-w-[484px] w-full grid gap-4 relative bg-white/5 overflow-y-auto overflow-x-clip md:overflow-hidden border border-[#1C1E20] rounded-t-[30px] rounded-b-[20px] mx-auto">
      <div className="p-5">
        <StakeToggle selected={Mode.STAKE} />
      </div>
      <TokenDirection mode={Mode.STAKE} />
    </div>
  );
}
