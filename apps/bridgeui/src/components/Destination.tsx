/* eslint-disable react/require-default-props */
import Image from "next/image";
import { SiEthereum } from "react-icons/si";

import { CHAINS, Direction, MANTLE_TOKEN_LIST } from "@config/constants";
import DirectionLabel from "@components/DirectionLabel";

export default function Destination({ direction }: { direction: Direction }) {
  return (
    <div className="pt-8 pb-2">
      <DirectionLabel
        direction="To"
        logo={
          direction === Direction.Withdraw ? (
            <SiEthereum />
          ) : (
            <Image
              alt="Mantle logo"
              src={MANTLE_TOKEN_LIST.logoURI}
              height={16}
              width={16}
            />
          )
        }
        chain={`${
          direction === Direction.Withdraw
            ? CHAINS[5].chainName
            : CHAINS[5001].chainName
        }`}
      />
    </div>
  );
}
