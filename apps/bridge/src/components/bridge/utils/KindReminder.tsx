"use client";

import { Direction, L1_CHAIN_ID, L2_CHAIN_ID } from "@config/constants";
import { Typography } from "@mantle/ui";
import { useEffect, useState } from "react";
import { MdClear, MdInfoOutline } from "react-icons/md";

const depositKey = "hideDepositReminder";
const withdrawKey = "hideWithdrawReminder";

export default function KindReminder({ direction }: { direction: Direction }) {
  const isTestnet = L1_CHAIN_ID === 5 || L2_CHAIN_ID === 5001;

  const [hideReminder, setHideReminder] = useState<string>("true");

  useEffect(() => {
    setHideReminder(
      localStorage?.getItem(
        direction === Direction.Deposit ? depositKey : withdrawKey
      ) || "false"
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          gas fee required
        </Typography>
        {isTestnet ? (
          <>
            <Typography variant="smallWidget">
              {direction === Direction.Deposit
                ? "• ETH (L1) to deposit from Goerli Testnet"
                : "• MNT (L2) to withdraw from Mantle Testnet"}
            </Typography>
            <Typography variant="smallWidget">
              {direction === Direction.Deposit
                ? "• MNT (L2) to transact on Mantle Testnet"
                : "• ETH (L1) to claim withdrawal on Goerli Testnet"}
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="smallWidget">
              {direction === Direction.Deposit
                ? "• ETH (L1) to deposit from Ethereum Mainnet"
                : "• MNT (L2) to withdraw from Mantle Mainnet"}
            </Typography>
            <Typography variant="smallWidget">
              {direction === Direction.Deposit
                ? "• MNT (L2) to transact on Mantle Mainnet"
                : "• ETH (L1) to claim withdrawal on Ethereum Mainnet"}
            </Typography>
          </>
        )}
      </div>

      <Typography variant="modalHeadingSm" className="text-[#C4C4C4]">
        <MdClear onClick={dismissReminder} className="cursor-pointer" />
      </Typography>
    </div>
  );
}
