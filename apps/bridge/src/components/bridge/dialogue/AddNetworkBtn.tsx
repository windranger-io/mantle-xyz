import Image from "next/image";
import { useNetwork } from "wagmi";

import { Button } from "@mantle/ui";

import { L2_CHAIN_ID } from "@config/constants";
import { useSwitchToNetwork } from "@hooks/web3/write/useSwitchToNetwork";

import MetamaskSvg from "public/deposited/metamask.svg";

export default function AddNetworkBtn() {
  const { addNetwork } = useSwitchToNetwork();

  const { chain: givenChain } = useNetwork();

  return (
    <Button
      type="button"
      size="full"
      disabled={givenChain?.id === L2_CHAIN_ID}
      className="h-14 flex flex-row gap-4 text-center items-center justify-center my-4"
      onClick={() => addNetwork(L2_CHAIN_ID)}
    >
      <Image src={MetamaskSvg} alt="metamask" height={26} width={26} />
      Add Mantle Network to Wallet
    </Button>
  );
}
