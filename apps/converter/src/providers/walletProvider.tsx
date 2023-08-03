"use client";

import { useContext } from "react";
import { useConnect } from "wagmi";

import { WalletModal } from "@mantle/ui";
import StateContext from "@providers/stateContext";

export default function WalletProvider() {
  // unpack the context
  const { chainId, client, setClient, walletModalOpen, setWalletModalOpen } =
    useContext(StateContext);

  // control wagmi connector
  const { connect, connectors } = useConnect();

  return (
    <WalletModal
      open={walletModalOpen}
      setOpen={setWalletModalOpen}
      onMetamask={() => {
        setClient({
          ...client,
          connector: "metaMask",
        });
        connect({
          connector: connectors.find((conn) => conn.id === "metaMask"),
        });
      }}
      onWalletConnect={() => {
        setClient({
          ...client,
          connector: "walletConnect",
        });
        connect({
          chainId,
          connector: connectors.find((conn) => conn.id === "walletConnect"),
        });
      }}
    />
  );
}
