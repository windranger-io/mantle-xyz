import { feeNotices } from "@config/constants";
import { AiFillExclamationCircle } from "react-icons/ai";

export function FeeNoticesCard() {
  return (
    <div className="bg-[#F26A1D]/[.15] p-4 rounded-2xl flex gap-1 items-start justify-start">
      <div className="p-1">
        <AiFillExclamationCircle className="text-[#FFA41C]" size={16} />
      </div>
      <div className="text-sm text-[#C4C4C4] leading-5">{feeNotices}</div>
    </div>
  );
}
