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
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    (process.env.NEXT_PUBLIC_SITE_URL
      ? `https://faucet.testnet.mantle.xyz`
      : // this should match the port used by the current app
        "http://localhost:3003")
  );
}

// export the absolute path
export const ABSOLUTE_PATH = getBaseUrl();

// Configure which chain to use (goerli)
export const L1_CHAIN_ID = 5;

// Configure the maximum balance the ui will mint until
export const MAX_BALANCE = 1000;

// The max amount that can be minted in a single tx (this is not enforced by the contract)
export const MAX_MINT = 1000;

// User must tweet the following before they can mint tokens...
export const REQUIRED_TWEET =
  /To #BuildonMantle, I am claiming test \$MNT tokens on https:\/\/([^\s]+) for @0xMantle, a next generation high-performance modular @Ethereum L2 built for hyperscaled dApps.\n\nLearn more: \[https:\/\/([^\]]+)\]/;

// set the available networks token contract address (goerli)
export const NETWORKS: Record<number, `0x${string}`> = {
  5: "0xc1dC2d65A2243c22344E725677A3E3BEBD26E604",
};

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
  // setup goerli so that it can be added to the users wallet
  5: {
    chainId: "0x5",
    chainName: "Goerli",
    nativeCurrency: {
      name: "GoerliETH",
      symbol: "GoerliETH",
      decimals: 18,
    },
    rpcUrls: [
      // infura backed redirect gateway
      `${ABSOLUTE_PATH}/rpc`,
      // public gateway
      `https://rpc.ankr.com/eth_goerli`,
    ],
    blockExplorerUrls: ["https://goerli.etherscan.io/"],
  },
};

// Formatted chains for use in wagmi
export const CHAINS_FORMATTED: Record<number, Chain> = {
  5: {
    testnet: true,
    name: CHAINS[5].chainName,
    network: CHAINS[5].chainName,
    rpcUrls: {
      default: {
        http: [CHAINS[5].rpcUrls[0]],
      },
      public: {
        http: [CHAINS[5].rpcUrls[1]],
      },
    },
    id: 5,
    nativeCurrency: CHAINS[5].nativeCurrency,
  },
};

// export the mintable erc20 tokens mint function ABI
export const ABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "for",
        type: "address",
      },
    ],
    name: "mintRecord",
    outputs: [
      {
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// everything by default
export default {
  APP_NAME,
  L1_CHAIN_ID,
  MAX_BALANCE,
  REQUIRED_TWEET,
  NETWORKS,
  CHAINS,
  ABI,
};
