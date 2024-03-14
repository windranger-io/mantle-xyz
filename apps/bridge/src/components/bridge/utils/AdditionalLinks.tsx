"use client";

import { useContext } from "react";
import StateContext from "@providers/stateContext";

import { MantleLink, Typography } from "@mantle/ui";
import { L1_CHAIN_ID, CHAINS_FORMATTED, L2_CHAIN_ID } from "@config/constants";

export function AdditionalLinks() {
  // unpack the context
  const { chainId } = useContext(StateContext);

  return (
    <div className="flex flex-col items-center gap-4 pb-10 mt-8">
      <Typography>
        Don’t have enough gas to bridge tokens? Get some{" "}
        {chainId === L1_CHAIN_ID
          ? CHAINS_FORMATTED[L1_CHAIN_ID].name
          : CHAINS_FORMATTED[L2_CHAIN_ID].name}{" "}
        {chainId === L1_CHAIN_ID
          ? CHAINS_FORMATTED[L1_CHAIN_ID].nativeCurrency.symbol
          : CHAINS_FORMATTED[L2_CHAIN_ID].nativeCurrency.symbol}{" "}
        here:
      </Typography>
      <div className="flex flex-col gap-2">
        {chainId !== L1_CHAIN_ID ? (
          <MantleLink
            variant="additionalLinks"
            target="blank"
            href="https://faucet.sepolia.mantle.xyz/"
          >
            Mantle Sepolia Faucet
          </MantleLink>
        ) : (
          <>
            <MantleLink
              variant="additionalLinks"
              target="blank"
              href="https://faucet.paradigm.xyz/"
            >
              Paradigm gETH Faucet
            </MantleLink>
            <MantleLink
              variant="additionalLinks"
              target="blank"
              href="https://goerlifaucet.com/"
            >
              Alchemy gETH Faucet
            </MantleLink>
          </>
        )}
      </div>
    </div>
  );
}
