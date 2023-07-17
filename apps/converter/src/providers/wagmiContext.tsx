"use client";

// this version of L1_CHAIN will use infura
import { CHAINS_FORMATTED, L1_CHAIN_ID } from "@config/constants";

// Required components for wagmi...
import { WagmiConfig, configureChains, createClient } from "wagmi";

import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";

import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";

const { chains, provider, webSocketProvider } = configureChains(
  // We support L1 and Mantle (depending on state of ui)
  [CHAINS_FORMATTED[L1_CHAIN_ID]],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: chain.rpcUrls.default.http[0],
      }),
    }),
    publicProvider(),
  ],
  { targetQuorum: 1 }
);

const client = createClient({
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
  ],
  provider,
  webSocketProvider,
});

interface WagmiProviderProps {
  children: React.ReactNode;
}

function WagmiProvider({ children }: WagmiProviderProps) {
  return <WagmiConfig client={client}>{children}</WagmiConfig>;
}

export { WagmiProvider };
