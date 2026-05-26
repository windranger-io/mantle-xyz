"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { type ReactNode } from "react";
import {
  connectorsForWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import {
  bitgetWallet,
  bitverseWallet,
  bybitWallet,
  coin98Wallet,
  imTokenWallet,
  metaMaskWallet,
  coinbaseWallet,
  okxWallet,
  rabbyWallet,
  safepalWallet,
  tokenPocketWallet,
  trustWallet,
  walletConnectWallet,
  xdefiWallet,
  binanceWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import {
  CHAINS_FORMATTED,
  MantleSepoliaChainId,
  MantleHoodiChainId,
  SUPPORTED_CHAIN_IDS,
} from "@config/constants";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [
        metaMaskWallet,
        bybitWallet,
        ...(process.env.NEXT_PUBLIC_DISABLE_BINANCE_WALLET === "true"
          ? []
          : [binanceWallet]),
        okxWallet,
        bitgetWallet,
        walletConnectWallet,
      ],
    },
    {
      groupName: "Others",
      wallets: [
        trustWallet,
        safepalWallet,
        tokenPocketWallet,
        coin98Wallet,
        coinbaseWallet,
        bitverseWallet,
        imTokenWallet,
        xdefiWallet,
        rabbyWallet,
      ],
    },
  ],
  {
    appName: "Mantle Testnet Faucet",
    // When NEXT_PUBLIC_WALLETCONNECT_ID is not configured, hand RainbowKit
    // the literal sentinel "YOUR_PROJECT_ID" — RainbowKit substitutes its
    // own bundled example project id internally
    // (see @rainbow-me/rainbowkit/dist/index.js getWalletConnectConnector),
    // so the WC modal preload returns a valid payload instead of crashing on
    // `Object.values(null)`. Production deployments should still set
    // NEXT_PUBLIC_WALLETCONNECT_ID to their own id from https://cloud.reown.com.
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID || "YOUR_PROJECT_ID",
  }
);

const chains = SUPPORTED_CHAIN_IDS.map((id) => CHAINS_FORMATTED[id]) as [
  (typeof CHAINS_FORMATTED)[typeof MantleSepoliaChainId],
  ...(typeof CHAINS_FORMATTED)[typeof MantleHoodiChainId][]
];

const config = createConfig({
  chains,
  connectors,
  transports: {
    [MantleSepoliaChainId]: http(),
    [MantleHoodiChainId]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function RainbowKit({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
