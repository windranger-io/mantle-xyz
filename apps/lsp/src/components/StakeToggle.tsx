import { cn } from "@mantle/ui/src/utils";
import Link from "next/link";

export enum Mode {
  STAKE = "stake",
  UNSTAKE = "unstake",
}

export default function StakeToggle({ selected }: { selected: Mode }) {
  return (
    <div className="flex flex-row items-center justify-center space-x-3">
      <Link
        href="/staking"
        className={cn(
          "w-full py-2 px-[10px] text-center rounded-lg",
          selected === Mode.STAKE
            ? "bg-white cursor-default text-type-inversed"
            : ""
        )}
      >
        <span>Stake</span>
      </Link>
      <Link
        href="/unstaking"
        className={cn(
          "w-full py-2 px-[10px] text-center rounded-lg",
          selected === Mode.UNSTAKE
            ? "bg-white cursor-default text-type-inversed"
            : ""
        )}
      >
        <span>Unstake</span>
      </Link>
    </div>
  );
}
