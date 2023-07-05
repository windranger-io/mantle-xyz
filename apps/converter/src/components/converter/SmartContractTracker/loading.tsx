import { ConvertCard } from "@components/ConvertCard";
import { cn } from "@mantle/ui/src/utils";
import { Typography } from "@mantle/ui";

export default function Loading() {
  return (
    <ConvertCard className="rounded-xl w-full">
      <div className="flex px-2 py-2 gap-3">
        <div className={cn("h-3 w-3 rounded-full bg-slate-100 mt-[3px]")} />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <Typography className="text-type-secondary">Status</Typography>
            <Typography className="font-bold text-type-primary">
              Loading
            </Typography>
          </div>
          <div className="flex flex-col">
            <Typography className="text-type-secondary">
              Balance in conversion contract
            </Typography>
            <Typography className="font-bold text-type-primary">
              --- MNT
            </Typography>
          </div>
        </div>
      </div>
    </ConvertCard>
  );
}
