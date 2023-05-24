/* eslint-disable react/require-default-props */
import { SiEthereum } from "react-icons/si";

import { CHAINS, Direction, L1_CHAIN_ID, L2_CHAIN_ID } from "@config/constants";
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
            ? CHAINS[L1_CHAIN_ID].chainName
            : CHAINS[L2_CHAIN_ID].chainName
        }`}
      />
    </div>
  );
}
