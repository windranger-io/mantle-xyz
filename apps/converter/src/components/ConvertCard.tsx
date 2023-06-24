import { ReactNode } from "react";

export function ConvertCard({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-lg w-full grid gap-4 relative bg-[#000000] overflow-y-auto overflow-x-clip md:overflow-hidden border border-[#1C1E20] rounded-t-[30px] rounded-b-[20px] mx-auto">
      {children}
    </div>
  );
}
