"use client";

import Loading from "@components/Loading";
import { AMOUNT_MAX_DISPLAY_DIGITS } from "@config/constants";

type OutputProps = {
  symbol: string;
  amount: string;
  isLoading: boolean;
};

export default function ConvertOutput({
  symbol,
  amount,
  isLoading,
}: OutputProps) {
  const newAmount = amount.slice(0, AMOUNT_MAX_DISPLAY_DIGITS);

  return (
    <div className="flex flex-row">
      <div className="flex items-center text-4xl">
        {isLoading ? (
          <span className="py-1.5 px-0 mr-2">
            <Loading />
          </span>
        ) : (
          <p className="flex text-4xl shrink border-0 focus:outline-none rounded-lg bg-transparent py-1.5 px-0 mr-2 focus:ring-0 appearance-none text-left max-w-[200px]">
            {newAmount || "0"}
          </p>
        )}
        <label htmlFor="convert-output" className="text-[#C4C4C4] font-bold">
          {symbol}
        </label>
      </div>
    </div>
  );
}
