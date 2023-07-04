"use client";

import { ConvertCard } from "@components/ConvertCard";
import {
  L1_CONVERTER_CONTRACT_ADDRESS,
  L1_MANTLE_TOKEN,
  L1_MANTLE_TOKEN_ADDRESS,
} from "@config/constants";
import { Typography } from "@mantle/ui";
import { cn } from "@mantle/ui/src/utils";
import { formatUnits, parseUnits } from "ethers/lib/utils.js";
import { useMemo, useState, useEffect } from "react";
import { useBalance } from "wagmi";

type SCTrackerProps = {
  halted: boolean;
  isLoadingHaltedStatus: boolean;
};

export function SmartContractTracker({
  halted,
  isLoadingHaltedStatus,
}: SCTrackerProps) {
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address: L1_CONVERTER_CONTRACT_ADDRESS,
    token: L1_MANTLE_TOKEN_ADDRESS,
  });

  // to avoid hydration error
  const [balanceDataClient, setBalanceDataClient] = useState<
    string | undefined
  >(undefined);
  useEffect(() => {
    setBalanceDataClient(balanceData?.formatted);
  }, [balanceData?.formatted]);

  const formattedBalance = useMemo(() => {
    const formatted = formatUnits(
      parseUnits(balanceDataClient || "0", L1_MANTLE_TOKEN.decimals),
      L1_MANTLE_TOKEN.decimals
    );
    const formattedMoney = new Intl.NumberFormat("us-US", {}).format(
      +formatted
    );

    return formattedMoney;
  }, [balanceDataClient]);

  // to avoid hydration error
  const [isLoadingHalted, setIsLoadingHalted] = useState<boolean>(false);
  useEffect(() => {
    setIsLoadingHalted(isLoadingHaltedStatus);
  }, [isLoadingHaltedStatus]);

  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);
  useEffect(() => {
    setIsLoadingBalance(isBalanceLoading);
  }, [isBalanceLoading]);

  if (isLoadingHalted || isLoadingBalance) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
  }

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
