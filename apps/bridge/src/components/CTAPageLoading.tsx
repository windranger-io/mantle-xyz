import { useContext } from "react";
import StateContext from "@providers/stateContext";

import { Direction } from "@config/constants";

import Image from "next/image";

import { Typography } from "@mantle/ui";
import { MdClear } from "react-icons/md";

import TxLink from "@components/TxLink";

export default function CTAPageLoading({
  l1TxHash,
  l2TxHash,
  closeModal,
}: {
  l1TxHash: string | boolean;
  l2TxHash: string | boolean;
  closeModal: () => void;
}) {
  const { ctaChainId: chainId } = useContext(StateContext);

  const direction = chainId === 5 ? Direction.Deposit : Direction.Withdraw;

  return (
    <>
      <span className="flex justify-between align-middle">
        <Typography variant="modalHeadingSm" className="text-center w-full">
          {direction === Direction.Deposit ? "Deposit" : "Withdrawal"} is on
          it’s way to {direction === Direction.Deposit ? "Mantle" : "Goerli"}
        </Typography>
        <Typography variant="modalHeading" className="text-white w-auto pt-1">
          <MdClear onClick={closeModal} className="cursor-pointer" />
        </Typography>
      </span>
      <div className="flex items-center justify-center py-4">
        <Image
          src="/preloader_animation.gif"
          width="40"
          height="40"
          alt="Mantle loading wheel"
        />
      </div>
      <div className="flex flex-col gap-4">
        <TxLink chainId={chainId} txHash={l1TxHash} />
        <TxLink chainId={chainId === 5 ? 5001 : 5} txHash={l2TxHash} />
      </div>
    </>
  );
}
