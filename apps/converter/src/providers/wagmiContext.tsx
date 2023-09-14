"use client";

// this version of L1_CHAIN will use infura
import { CHAINS_FORMATTED, L1_CHAIN_ID } from "@config/constants";

// Required components for wagmi...
import { WagmiConfig, configureChains, createConfig } from "wagmi";

import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

import { BitgetWalletConnector } from "@connectors/bitgetWallet";
import { BybitWalletConnector } from "@connectors/bybitWallet";
import { Coin98WalletConnector } from "@connectors/coin98";
import { RabbyWalletConnector } from "@connectors/rabbyWallet";
import { TokenPocketConnector } from "@connectors/tokenPocket";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  // We support L1 and Mantle (depending on state of ui)
  [CHAINS_FORMATTED[L1_CHAIN_ID]],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: chain.rpcUrls.default.http[0],
      }),
    }),
    publicProvider(),
  ]
);

const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({
      chains,
      options: {
        UNSTABLE_shimOnConnectSelectAccount: true,
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: (detectedName) =>
          `Injected (${
            typeof detectedName === "string"
              ? detectedName
              : detectedName.join(", ")
          })`,
        shimDisconnect: true,
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID || "",
      },
    }),
    new BybitWalletConnector({
      chains,
      options: {
        name: "BybitWallet",
      },
    }),
    new BitgetWalletConnector({
      chains,
      options: {
        name: "BitgetWallet",
      },
    }),
    new TokenPocketConnector({
      chains,
    }),
    new RabbyWalletConnector({
      chains,
    }),
    new Coin98WalletConnector({
      chains,
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

interface WagmiProviderProps {
  children: React.ReactNode;
}

function WagmiProvider({ children }: WagmiProviderProps) {
  return <WagmiConfig config={config}>{children}</WagmiConfig>;
}

export { WagmiProvider };
