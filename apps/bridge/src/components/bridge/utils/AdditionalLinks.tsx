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
            href="https://faucet.testnet.mantle.xyz/"
          >
            Mantle Testnet Faucet
          </MantleLink>
        ) : (
          <>
            <MantleLink
              variant="additionalLinks"
              rel="noreferrer noopener"
              target="_blank"
              href="https://www.infura.io/faucet/sepolia"
            >
              Infura sepoliaETH Faucet
            </MantleLink>

            <MantleLink
              variant="additionalLinks"
              rel="noreferrer noopener"
              target="_blank"
              href="https://sepoliafaucet.com/"
            >
              Alchemy sepoliaETH Faucet
            </MantleLink>
          </>
        )}
      </div>
    </div>
  );
}
