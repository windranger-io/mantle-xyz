import { Chain } from "wagmi";

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

// Configure which chain to use (Mantle Sepolia)
export const L1_CHAIN_ID = 5003;

// set the available chains configuration to allow network to be added
export const CHAINS: Record<
  number,
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
  5003: {
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
};

// Formatted chains for use in wagmi
export const CHAINS_FORMATTED: Record<number, Chain> = {
  5003: {
    testnet: true,
    name: CHAINS[5003].chainName,
    network: CHAINS[5003].chainName,
    rpcUrls: {
      default: {
        http: [CHAINS[5003].rpcUrls[0]],
      },
      public: {
        http: [CHAINS[5003].rpcUrls[0]],
      },
    },
    id: 5003,
    nativeCurrency: CHAINS[5003].nativeCurrency,
  },
};

// everything by default
export default {
  APP_NAME,
  L1_CHAIN_ID,
  CHAINS,
};
