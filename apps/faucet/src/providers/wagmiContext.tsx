"use client";

// Register all supported faucet chains
import { CHAINS_FORMATTED, SUPPORTED_CHAIN_IDS } from "@config/constants";

// Required components for wagmi...
import { WagmiConfig, configureChains, createConfig } from "wagmi";

import {
  BitgetWalletConnector,
  BybitWalletConnector,
  Coin98WalletConnector,
  RabbyWalletConnector,
  TokenPocketConnector,
} from "@mantle/wallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  SUPPORTED_CHAIN_IDS.map((id) => CHAINS_FORMATTED[id]),
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: chain.rpcUrls.default.http[0],
      }),
    }),
    publicProvider(),
  ]
);

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID;

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
    // Only register WalletConnect when a valid projectId is configured.
    // An empty/invalid key causes the relay to spam WebSocket 3000 errors.
    ...(walletConnectProjectId
      ? [
          new WalletConnectConnector({
            chains,
            options: {
              projectId: walletConnectProjectId,
            },
          }),
        ]
      : []),
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
