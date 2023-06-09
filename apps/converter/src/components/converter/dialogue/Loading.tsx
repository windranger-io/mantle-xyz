import { useContext } from "react";
import StateContext from "@providers/stateContext";

import Image from "next/image";

import { Typography } from "@mantle/ui";
import { MdClear } from "react-icons/md";

import {
  L1_CHAIN_ID,
  CONVERSION_RATE,
  L1_BITDAO_TOKEN,
  L1_MANTLE_TOKEN,
} from "@config/constants";
import TxLink from "@components/converter/utils/TxLink";
import { formatUnits, parseUnits } from "ethers/lib/utils.js";

export default function Loading({
  txHash,
  closeModal,
}: {
  txHash: string | boolean;
  closeModal: () => void;
}) {
  const { amount } = useContext(StateContext);

  return (
    <>
      <span className="flex justify-between align-middle">
        <Typography variant="modalHeadingSm" className="text-center w-full">
          Pending Conversion
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
      <div className="text-center">
        <div>
          You are converting{" "}
          {formatUnits(
            parseUnits(amount || "0", L1_BITDAO_TOKEN.decimals),
            L1_BITDAO_TOKEN.decimals
          )}{" "}
          $BIT to{" "}
          {formatUnits(
            (() => {
              let bn = parseUnits(amount || "0", L1_MANTLE_TOKEN.decimals);
              if (CONVERSION_RATE !== 1) {
                bn = bn.mul(CONVERSION_RATE * 100).div(100);
              }
              return bn;
            })(),
            L1_MANTLE_TOKEN.decimals
          ).toString()}{" "}
          $MNT.
        </div>
        <div>Go grab some coffee, I promise it&apos;ll be done by then!</div>
      </div>

      <div className="flex flex-col gap-4">
        <TxLink chainId={L1_CHAIN_ID} txHash={txHash} />
      </div>
    </>
  );
}
