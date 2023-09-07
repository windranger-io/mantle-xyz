// import { useEffect } from "react";
import Image from "next/image";
import { MdClear } from "react-icons/md";
// import { useRouter } from "next/navigation";

import { L1_CHAIN_ID } from "@config/constants";
import { Typography } from "@mantle/ui";
// import { useToast } from "@hooks/useToast";
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
  // const { createToast } = useToast();
  // const router = useRouter();
  // useEffect(() => {
  //   createToast({
  //     type: "onGoing",
  //     borderLeft: "bg-blue-600",
  //     content: (
  //       <div className="flex flex-col">
  //         <Typography variant="body">
  //           <b>Migration initiated</b>
  //         </Typography>
  //         <Typography variant="body">Will be available in ~5 mins</Typography>
  //       </div>
  //     ),
  //     id: `${txHash}-pending-migration`,
  //     buttonText: "View",
  //     onButtonClick: () => {
  //       router.push("/");
  //       return true;
  //     },
  //   });
  // }, []);

  return (
    <>
      <span className="flex justify-between align-middle">
        <Typography variant="modalHeadingSm" className="text-center w-full">
          Pending migration request
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
          You are requesting migrate {from} $BIT to {to} $MNT.
        </div>
        <div>Go grab some coffee, I promise it&apos;ll be done by then!</div>
      </div>

      <div className="flex flex-col gap-4">
        <TxLink chainId={L1_CHAIN_ID} txHash={txHash} />
      </div>
    </>
  );
}
