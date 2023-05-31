import {
  CONVERSION_RATE,
  L1_BITDAO_TOKEN,
  L1_MANTLE_TOKEN,
} from "@config/constants";
import { MantleLogo } from "@components/converter/utils/MantleLogo";

import BalanceLabel from "@components/converter/utils/BalanceLabel";

import { formatUnits, parseUnits } from "ethers/lib/utils.js";
import { useContext, useMemo } from "react";
import StateContext from "@providers/stateContext";
import { formatBigNumberString } from "@utils/formatStrings";

export default function Destination() {
  const { amount, balances } = useContext(StateContext);

  const value = useMemo(() => {
    return formatUnits(
      parseUnits(amount || "0", L1_BITDAO_TOKEN.decimals)
        .mul(CONVERSION_RATE * 100)
        .div(100),
      L1_BITDAO_TOKEN.decimals
    );
  }, [amount]);

  return (
    <div className="pt-6 pb-2">
      <div className="flex flex-row w-full justify-between items-center pt-4">
        <div className="flex flex-row items-center gap-3">
          <MantleLogo />
          <div className="flex flex-row gap-2 text-4xl">
            <div
              className="max-w-[min(346px,100vw)] truncate"
              title={`${value} MNT`}
            >
              {value}
            </div>
            <span className="text-[#C4C4C4] font-bold">MNT</span>
          </div>
        </div>
        <div className="" />
        <div className="flex flex-row items-center gap-3" />
      </div>
      <div className="flex flex-col w-full justify-end text-right">
        <div className="flex justify-end">
          <BalanceLabel
            className=""
            label="Available"
            logo={<span />}
            balance={`${
              Number.isNaN(
                parseFloat(balances?.[L1_MANTLE_TOKEN.address] || "")
              )
                ? "0.0"
                : formatBigNumberString(balances?.[L1_MANTLE_TOKEN.address]) ||
                  "0.0"
            }${" "}${L1_MANTLE_TOKEN.symbol}`}
          />
        </div>
      </div>
    </div>
  );
}
