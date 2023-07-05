import { useBalance } from "wagmi";
import { formatUnits, parseUnits } from "ethers/lib/utils.js";
import { Typography } from "@mantle/ui";
import { cn } from "@mantle/ui/src/utils";
import { ConvertCard } from "@components/ConvertCard";
import {
  L1_CONVERTER_CONTRACT_ADDRESS,
  L1_MANTLE_TOKEN,
  L1_MANTLE_TOKEN_ADDRESS,
} from "@config/constants";

type SCTrackerProps = {
  halted: boolean;
};

export function SmartContractTracker({ halted }: SCTrackerProps) {
  const { data: balanceData } = useBalance({
    address: L1_CONVERTER_CONTRACT_ADDRESS,
    token: L1_MANTLE_TOKEN_ADDRESS,
    suspense: true,
  });

  const formatted = formatUnits(
    parseUnits(balanceData?.formatted || "0", L1_MANTLE_TOKEN.decimals),
    L1_MANTLE_TOKEN.decimals
  );

  const formattedBalance = new Intl.NumberFormat("us-US", {}).format(
    +formatted
  );

  return (
    <ConvertCard className="rounded-xl w-full">
      <div className="flex px-2 py-2 gap-3">
        <div
          className={cn("h-3 w-3 rounded-full bg-green-400 mt-[3px]", {
            "bg-red-500": halted,
          })}
        />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <Typography className="text-type-secondary">Status</Typography>
            <Typography className="font-bold text-type-primary">
              {halted ? "Un" : "A"}ctive ({!halted ? "Unh" : "H"}alted)
            </Typography>
          </div>
          <div className="flex flex-col">
            <Typography className="text-type-secondary">
              Balance in conversion contract
            </Typography>
            <Typography className="font-bold text-type-primary">
              {formattedBalance} MNT
            </Typography>
          </div>
        </div>
      </div>
    </ConvertCard>
  );
}
