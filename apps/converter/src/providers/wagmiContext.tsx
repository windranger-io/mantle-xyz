"use client";

// this version of L1_CHAIN will use infura
import { CHAINS_FORMATTED, L1_CHAIN_ID } from "@config/constants";

// Required components for wagmi...
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { Web3Modal } from "@web3modal/react";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";

// import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
// import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

// import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
// import { publicProvider } from "wagmi/providers/public";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || "";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  // We support L1 and Mantle (depending on state of ui)
  [CHAINS_FORMATTED[L1_CHAIN_ID]],
  // [
  //   jsonRpcProvider({
  //     rpc: (chain) => ({
  //       http: chain.rpcUrls.default.http[0],
  //     }),
  //   }),
  //   publicProvider(),
  // ]
  [w3mProvider({ projectId })]
);

const config = createConfig({
  autoConnect: true,
  // connectors: [
  //   new MetaMaskConnector({
  //     chains,
  //     options: {
  //       UNSTABLE_shimOnConnectSelectAccount: true,
  //     },
  //   }),
  //   new InjectedConnector({
  //     chains,
  //     options: {
  //       name: (detectedName) =>
  //         `Injected (${
  //           typeof detectedName === "string"
  //             ? detectedName
  //             : detectedName.join(", ")
  //         })`,
  //       shimDisconnect: true,
  //     },
  //   }),
  //   new WalletConnectConnector({
  //     chains,
  //     options: {
  //       projectId: projectId,
  //     },
  //   }),
  // ],
  connectors: [
    ...w3mConnectors({ projectId, chains }),
    new MetaMaskConnector({
      chains,
      options: {
        UNSTABLE_shimOnConnectSelectAccount: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

const ethereumClient = new EthereumClient(config, chains);

interface WagmiProviderProps {
  children: React.ReactNode;
}

function WagmiProvider({ children }: WagmiProviderProps) {
  return (
    <>
      <WagmiConfig config={config}>{children}</WagmiConfig>
      <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
        explorerRecommendedWalletIds={[
          "1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369", // rainbow
          "18388be9ac2d02726dbac9777c96efaac06d744b2f6d580fccdd4127a6d01fd1", // rabby
        ]}
      />
    </>
  );
}

export { WagmiProvider };
