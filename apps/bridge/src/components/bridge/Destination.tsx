/* eslint-disable react/require-default-props */
import { SiEthereum } from "react-icons/si";

import {
  CHAINS,
  Direction,
  L1_CHAIN_ID,
  L2_CHAIN_ID,
  Token,
} from "@config/constants";
import DirectionLabel from "@components/bridge/utils/DirectionLabel";
import { MantleLogo } from "@components/bridge/utils/MantleLogo";
import { useContext } from "react";
import StateContext from "@providers/stateContext";
import { formatBigNumberString, localeZero } from "@mantle/utils";

export default function Destination({
  direction,
  destination,
}: {
  direction: Direction;
  destination: Token;
}) {
  const { client, destinationTokenAmount } = useContext(StateContext);

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
      <input
        key={destination?.address}
        disabled
        type="text"
        placeholder={
          !client?.isConnected
            ? "Unknown. Connect Wallet."
            : `You will receive: ${
                Number.isNaN(parseFloat(destinationTokenAmount || ""))
                  ? localeZero
                  : formatBigNumberString(
                      destinationTokenAmount,
                      3,
                      true,
                      false
                    ) || localeZero
              } ${destination.symbol}`
        }
        className="placeholder:text-lg placeholder:font-normal placeholder:leading-[140%] py-[11px] px-5 w-full border-1 rounded-lg border-[#41474D] focus-within:ring-1 focus:outline-none  bg-black focus:ring-0 focus:ring-white/70 appearance-none"
      />
    </div>
  );
}
