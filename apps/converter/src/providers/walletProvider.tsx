"use client";

import { useContext } from "react";
import { useConnect } from "wagmi";

import StateContext from "@providers/stateContext";
import dynamic from "next/dynamic";

// set the walletModal up as a dynamic container
const DynamicWalletModal = dynamic(
  async () => {
    const { WalletModal } = await import("@mantle/ui");
    return WalletModal;
  },
  {
    ssr: false,
  }
);

export default function WalletProvider() {
  // unpack the context
  const { chainId, client, setClient, walletModalOpen, setWalletModalOpen } =
    useContext(StateContext);

  // control wagmi connector
  const { connect, connectors } = useConnect({
    onSuccess() {
      setWalletModalOpen(false);
    },
  });

  // check for injected connector
  const hasInjected = connectors.find((conn) => conn.id === "injected");
  // const wallets;
  // console.log("hasInjected", hasInjected, connectors, client);
  return (
    <DynamicWalletModal
      open={walletModalOpen}
      setOpen={setWalletModalOpen}
      connectors={connectors as []}
      injectedName={hasInjected?.name?.replace(/Injected\s\(([^)]+)\)/, "$1")}
      onInjected={
        hasInjected && hasInjected.name !== "Injected (MetaMask)"
          ? () => {
              setClient({
                ...client,
                connector: "injected",
              });
              connect({
                chainId,
                connector: hasInjected,
              });
            }
          : undefined
      }
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
      onBybitWallet={() => {
        setClient({
          ...client,
          connector: "bybitWallet",
        });
        connect({
          connector: connectors.find((conn) => conn.id === "bybitWallet"),
        });
      }}
      onBitgetWallet={() => {
        setClient({
          ...client,
          connector: "bitgetWallet",
        });
        connect({
          connector: connectors.find((conn) => conn.id === "bitgetWallet"),
        });
      }}
      onTokenPocket={() => {
        setClient({
          ...client,
          connector: "tokenPocket",
        });
        connect({
          connector: connectors.find((conn) => conn.id === "tokenPocket"),
        });
      }}
      onRabbyWallet={() => {
        setClient({
          ...client,
          connector: "rabbyWallet",
        });
        connect({
          connector: connectors.find((conn) => conn.id === "rabbyWallet"),
        });
      }}
      onCoin98Wallet={() => {
        setClient({
          ...client,
          connector: "coin98Wallet",
        });
        connect({
          connector: connectors.find((conn) => conn.id === "coin98Wallet"),
        });
      }}
    />
  );
}
