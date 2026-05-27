"use client";

import { useContext } from "react";
import { MantleLink, Typography } from "@mantle/ui";

import StateContext from "@providers/stateContext";
import { MantleHoodiChainId } from "@config/constants";

const CHAIN_LINKS = {
  sepolia: {
    label: "Mantle Sepolia",
    bridgeHref: "https://app.mantle.xyz/bridge?network=sepolia",
    explorerHref: "https://sepolia.mantlescan.xyz/",
  },
  hoodi: {
    label: "Mantle Hoodi",
    bridgeHref: "https://app.mantle.xyz/bridge?network=hoodi",
    explorerHref: "https://explorer.hoodi.mantle.xyz/",
  },
} as const;

export function AdditionalLinks() {
  const { selectedChainId } = useContext(StateContext);
  const links =
    selectedChainId === MantleHoodiChainId
      ? CHAIN_LINKS.hoodi
      : CHAIN_LINKS.sepolia;

  return (
    <div className="flex flex-col items-center gap-4 pb-10">
      <Typography>Need to bridge assets to {links.label}?</Typography>
      <div className="flex flex-col gap-2">
        <MantleLink
          variant="additionalLinks"
          rel="noreferrer noopener"
          target="_blank"
          href={links.bridgeHref}
        >
          {links.label} Bridge
        </MantleLink>

        <MantleLink
          variant="additionalLinks"
          rel="noreferrer noopener"
          target="_blank"
          href={links.explorerHref}
        >
          {links.label} Explorer
        </MantleLink>
      </div>
    </div>
  );
}
