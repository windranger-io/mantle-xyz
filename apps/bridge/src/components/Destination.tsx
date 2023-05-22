/* eslint-disable react/require-default-props */
import { SiEthereum } from "react-icons/si";

import { CHAINS, Direction } from "@config/constants";
import DirectionLabel from "@components/DirectionLabel";
import { MantleLogo } from "./MantleLogo";

export default function Destination({ direction }: { direction: Direction }) {
  return (
    <div className="pt-8 pb-2">
      <DirectionLabel
        direction="To"
        logo={
          direction === Direction.Withdraw ? <SiEthereum /> : <MantleLogo />
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
