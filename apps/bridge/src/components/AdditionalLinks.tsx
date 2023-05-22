"use client";

import { useContext } from "react";
import StateContext from "@providers/stateContext";

import { MantleLink, Typography } from "@mantle/ui";

export function AdditionalLinks() {
  // unpack the context
  const { chainId } = useContext(StateContext);

  return (
    <div className="flex flex-col items-center gap-4 pb-10 ">
      <Typography>
        Don’t have enough gas to bridge tokens? Get some{" "}
        {chainId !== 5 ? "Mantle Testnet BIT" : "goerli ETH"} here:
      </Typography>
      <div className="flex flex-col gap-2">
        {chainId !== 5 ? (
          <MantleLink
            variant="additionalLinks"
            target="blank"
            href="https://faucet.testnet.mantle.xyz/"
          >
            Mantle Testnet Faucet
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
