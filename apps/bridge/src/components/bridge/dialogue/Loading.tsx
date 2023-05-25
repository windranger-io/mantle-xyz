import { useContext } from "react";
import StateContext from "@providers/stateContext";

import {
  Direction,
  CHAINS_FORMATTED,
  L1_CHAIN_ID,
  L2_CHAIN_ID,
} from "@config/constants";

import Image from "next/image";

import { Typography } from "@mantle/ui";
import { MdClear } from "react-icons/md";

import TxLink from "@components/bridge/utils/TxLink";

export default function Loading({
  tx1Hash,
  tx2Hash,
  closeModal,
}: {
  tx1Hash: string | boolean;
  tx2Hash: string | boolean;
  closeModal: () => void;
}) {
  const { ctaChainId: chainId } = useContext(StateContext);

  const direction =
    chainId === L1_CHAIN_ID ? Direction.Deposit : Direction.Withdraw;

  return (
    <>
      <span className="flex justify-between align-middle">
        <Typography variant="modalHeadingSm" className="text-center w-full">
          {direction === Direction.Deposit ? "Deposit" : "Withdrawal"} is on
          it’s way to{" "}
          {direction === Direction.Deposit
            ? CHAINS_FORMATTED[L2_CHAIN_ID].name
            : CHAINS_FORMATTED[L1_CHAIN_ID].name}
        </Typography>
        <Typography variant="modalHeading" className="text-white w-auto pt-1">
          <MdClear onClick={closeModal} className="cursor-pointer" />
        </Typography>
      </span>
      <div className="flex items-center justify-center py-4">
        <Image
          src="/preloader_animation_160.gif"
          width="80"
          height="80"
          alt="Mantle loading wheel"
        />
      </div>
      <div className="flex flex-col gap-4">
        <TxLink chainId={chainId} txHash={tx1Hash} />
        <TxLink
          chainId={chainId === L1_CHAIN_ID ? L2_CHAIN_ID : L1_CHAIN_ID}
          txHash={tx2Hash}
        />
      </div>
    </>
  );
}
