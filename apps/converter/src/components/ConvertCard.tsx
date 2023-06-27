import { cn } from "@mantle/ui/src/utils";
import { ReactNode } from "react";

type Props = {
  // eslint-disable-next-line react/require-default-props
  className?: string;
  children: ReactNode;
};

export function ConvertCard({ children, className }: Props) {
  return (
    <div
      className={cn(
        "md:max-w-lg w-full grid gap-4 relative bg-[#000000] overflow-y-auto overflow-x-clip md:overflow-hidden border border-[#1C1E20] rounded-t-[30px] rounded-b-[20px] mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}
