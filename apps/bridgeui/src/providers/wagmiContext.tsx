"use client";

import { MANTLE_TESTNET_CHAIN } from "@config/constants";

import { WagmiConfig, configureChains, createClient } from "wagmi";

import { goerli } from "wagmi/chains";

import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";

const { chains, provider, webSocketProvider } = configureChains(
  // We support Goerli and Mantle testnet (depending on state of ui)
  [goerli, MANTLE_TESTNET_CHAIN],
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
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: "wagmi",
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
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
