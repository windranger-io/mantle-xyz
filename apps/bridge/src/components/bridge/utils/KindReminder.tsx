"use client";

import { Direction } from "@config/constants";
import { Typography } from "@mantle/ui";
import { useEffect, useState } from "react";
import { MdClear, MdInfoOutline } from "react-icons/md";

const depositKey = "hideDepositReminder";
const withdrawKey = "hideWithdrawReminder";

export default function KindReminder({ direction }: { direction: Direction }) {
  const [hideReminder, setHideReminder] = useState<string>("true");

  useEffect(() => {
    setHideReminder(
      localStorage?.getItem(
        direction === Direction.Deposit ? depositKey : withdrawKey
      ) || "false"
    );
  }, []);

  const dismissReminder = () => {
    if (direction === Direction.Deposit) {
      localStorage?.setItem(depositKey, "true");
    } else {
      localStorage?.setItem(withdrawKey, "true");
    }

    setHideReminder("true");
  };

  if (hideReminder === "true") {
    return null;
  }

  return (
    <div className="bg-white/[.08] rounded-card p-4 mx-auto flex content-start gap-x-2">
      <Typography variant="modalHeadingSm" className="text-[#C4C4C4]">
        <MdInfoOutline />
      </Typography>

      <div className="grow">
        <Typography variant="smallWidget" className="uppercase">
          kind reminder
        </Typography>
        <Typography variant="smallWidget">
          {direction === Direction.Deposit
            ? "You will need ETH on L1 as gas fees to deposit your tokens and MNT on L2 as gas fees to transact your deposited tokens on Mantle Network."
            : "You will need MNT on L2 as gas fees to initiate the withdrawal and ETH on L1 as gas fees to claim the tokens on Ethereum Mainnet."}
        </Typography>
      </div>

      <Typography variant="modalHeadingSm" className="text-[#C4C4C4]">
        <MdClear onClick={dismissReminder} className="cursor-pointer" />
      </Typography>
    </div>
  );
}
