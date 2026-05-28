import { Chain } from "@rainbow-me/rainbowkit";

// Configure the applications name
export const APP_NAME = "Mantle Testnet Faucet";

// Configure deta description
export const META =
  "Drip tokens from the faucet for your testnet wallet, and test your dApps deployed on Mantle Testnet.";

// Configure OG Title
export const OG_TITLE = "Get Your Hyperscaling Rocket Fuel";

// Configure OG Desc
export const OG_DESC =
  "Fund your testnet wallet here to start to #BuildonMantle.";

// Configure Twiiter Title
export const TWITTER_TITLE = "Mantle Testnet Faucet";

// Configure Twiiter Desc
export const TWITTER_DESC =
  "Fund your testnet wallet here to start to #BuildonMantle.";

// Get the current absolute path from the env
export function getBaseUrl() {
  // return the fully resolved absolute url
  return (
    // eslint-disable-next-line no-nested-ternary
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? process.env.NEXT_PUBLIC_VERCEL_URL.indexOf("http") === 0
        ? process.env.NEXT_PUBLIC_VERCEL_URL
        : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : false) ||
    (process.env.NEXT_PUBLIC_SITE_URL
      ? `https://faucet.sepolia.mantle.xyz`
      : // this should match the port used by the current app
        "http://127.0.0.1:3002")
  );
}

// export the absolute path
export const ABSOLUTE_PATH = getBaseUrl();

// op-faucet backend URL (JSON-RPC 2.0)
export const FAUCET_API_URL =
  process.env.NEXT_PUBLIC_FAUCET_API_URL || "http://localhost:8545";

// Chain IDs
export const MantleSepoliaChainId = 5003;
export const MantleHoodiChainId = 50002;

// All supported faucet chain IDs (used for the chain selector)
export const SUPPORTED_CHAIN_IDS = [
  MantleSepoliaChainId,
  MantleHoodiChainId,
] as const;
export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];

// Minimum faucet reserve required to allow claims (in MNT, whole units).
// When the per-chain reserve drops below this the Claim button is disabled.
export const MIN_FAUCET_RESERVE_MNT = 1000;

// set the available chains configuration to allow network to be added
export const CHAINS: Record<
  SupportedChainId,
  {
    chainId: string;
    chainName: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls: string[];
  }
> = {
  [MantleSepoliaChainId]: {
    chainId: "0x138b",
    chainName: "Mantle Sepolia",
    nativeCurrency: {
      name: "MNT",
      symbol: "MNT",
      decimals: 18,
    },
    rpcUrls: [
      process.env.NEXT_PUBLIC_MANTLE_SEPOLIA_RPC_URL ||
        "https://rpc.sepolia.mantle.xyz",
    ],
    blockExplorerUrls: ["https://sepolia.mantlescan.xyz/"],
  },
  [MantleHoodiChainId]: {
    chainId: "0x1389",
    chainName: "Mantle Hoodi",
    nativeCurrency: {
      name: "MNT",
      symbol: "MNT",
      decimals: 18,
    },
    rpcUrls: [
      process.env.NEXT_PUBLIC_MANTLE_HOODI_RPC_URL ||
        "https://rpc.hoodi.mantle.xyz",
    ],
    blockExplorerUrls: ["https://explorer.hoodi.mantle.xyz/"],
  },
};

// Formatted chains for use in wagmi
export const CHAINS_FORMATTED: Record<
  SupportedChainId,
  Chain & { network: string }
> = {
  [MantleSepoliaChainId]: {
    testnet: true,
    name: CHAINS[MantleSepoliaChainId].chainName,
    network: CHAINS[MantleSepoliaChainId].chainName,
    rpcUrls: {
      default: {
        http: [CHAINS[MantleSepoliaChainId].rpcUrls[0]],
      },
      public: {
        http: [CHAINS[MantleSepoliaChainId].rpcUrls[0]],
      },
    },
    id: MantleSepoliaChainId,
    nativeCurrency: CHAINS[MantleSepoliaChainId].nativeCurrency,
  },
  [MantleHoodiChainId]: {
    testnet: true,
    name: CHAINS[MantleHoodiChainId].chainName,
    network: CHAINS[MantleHoodiChainId].chainName,
    rpcUrls: {
      default: {
        http: [CHAINS[MantleHoodiChainId].rpcUrls[0]],
      },
      public: {
        http: [CHAINS[MantleHoodiChainId].rpcUrls[0]],
      },
    },
    id: MantleHoodiChainId,
    nativeCurrency: CHAINS[MantleHoodiChainId].nativeCurrency,
  },
};

// everything by default
export default {
  APP_NAME,
  MantleSepoliaChainId,
  MantleHoodiChainId,
  SUPPORTED_CHAIN_IDS,
  CHAINS,
};
