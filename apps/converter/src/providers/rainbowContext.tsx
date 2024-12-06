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
import { CHAINS_FORMATTED, L1_CHAIN_ID } from "@config/constants";

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
        bitverseWallet,
        imTokenWallet,
        xdefiWallet,
        rabbyWallet,
      ],
    },
  ],
  {
    appName: "migrator",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID!,
  }
);

export const wagmiConfig = createConfig({
  connectors,
  chains: [CHAINS_FORMATTED[L1_CHAIN_ID]],
  transports: {
    [CHAINS_FORMATTED[L1_CHAIN_ID].id]: http(
      CHAINS_FORMATTED[L1_CHAIN_ID].rpcUrls.private?.http[0] ||
        CHAINS_FORMATTED[L1_CHAIN_ID].rpcUrls.default.http[0]
    ),
  },
  ssr: false,
  syncConnectedChain: true,
  multiInjectedProviderDiscovery: true,
});

const queryClient = new QueryClient();

export function RainbowKit({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
