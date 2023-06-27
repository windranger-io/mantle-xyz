import Image from "next/image";

import { Typography } from "@mantle/ui";
import { MdClear } from "react-icons/md";

import { L1_CHAIN_ID } from "@config/constants";
import TxLink from "@components/converter/utils/TxLink";

export default function Loading({
  txHash,
  closeModal,
  from,
  to,
}: {
  txHash: string | boolean;
  closeModal: () => void;
  from: string;
  to: string;
}) {
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
          You are converting {from} $BIT to {to} $MNT.
        </div>
        <div>Go grab some coffee, I promise it&apos;ll be done by then!</div>
      </div>

      <div className="flex flex-col gap-4">
        <TxLink chainId={L1_CHAIN_ID} txHash={txHash} />
      </div>
    </>
  );
}
