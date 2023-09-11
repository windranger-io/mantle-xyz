/* eslint-disable @typescript-eslint/dot-notation */
import { BigNumberish } from "ethers";
import { Address, Chain } from "wagmi";

// TODO: Add contract addresses in this pattern.
// export const L1_BITDAO_TOKEN_ADDRESSES: Record<number, `0x${string}`> = {
//   1: '0x1A4b46696b2bB4794Eb3D4c26f1c55F9170fa4C5',
//   5: '0x5a94Dc6cc85fdA49d8E9A8b85DDE8629025C42be',
// }

export const CHAIN_ID = +(process.env["NEXT_PUBLIC_CHAIN_ID"] || "5");

// TODO: Do all of these properly later.

// Configure the applications name
export const APP_NAME = "MantleETH";

// Configure deta description
export const META = "Stake ETH for mETH";

// Configure OG Title
export const OG_TITLE = "MantleETH | Mantle Network";

// Configure OG Desc
export const OG_DESC = "Stake ETH for mETH";

// Configure Twitter Title
export const TWITTER_TITLE = "MantleETH | Mantle Network";

// Configure Twitter Desc
export const TWITTER_DESC = "Stake ETH for mETH";

export const AMOUNT_MAX_DISPLAY_DIGITS = 10;

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
    // eslint-disable-next-line no-nested-ternary
    (process.env.NEXT_PUBLIC_SITE_URL
      ? process.env.NEXT_PUBLIC_SITE_URL
      : // this should match the port used by the current app
        "http://localhost:3010")
  );
}

// export the absolute path
export const ABSOLUTE_PATH = getBaseUrl();

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
  1: {
    chainId: "0x1",
    chainName: "Ethereum Mainnet",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [
      // infura backed redirect gateway
      `${ABSOLUTE_PATH}/rpc`,
      // public gateway
      `https://rpc.ankr.com/eth`,
    ],
    blockExplorerUrls: ["https://etherscan.io/"],
  },
  // setup goerli so that it can be added to the users wallet
  5: {
    chainId: "0x5",
    chainName: "Goerli",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [
      "https://eth-goerli.g.alchemy.com/v2/KiclVHArnqzL30SUwRe2KA8AcxzG_TsB",
      // infura backed redirect gateway
      // `${ABSOLUTE_PATH}/rpc`,
      // public gateway
      `https://rpc.ankr.com/eth_goerli`,
    ],
    blockExplorerUrls: ["https://goerli.etherscan.io/"],
  },
};

export const CHAINS_FORMATTED: Record<number, Chain> = {
  1: {
    testnet: false,
    name: CHAINS[1].chainName,
    network: CHAINS[1].chainName,
    rpcUrls: {
      default: {
        http: [CHAINS[1].rpcUrls[0]],
      },
      public: {
        http: [CHAINS[1].rpcUrls[1]],
      },
    },
    id: 1,
    nativeCurrency: CHAINS[1].nativeCurrency,
  },
  5: {
    testnet: true,
    name: CHAINS[5].chainName,
    network: CHAINS[5].chainName,
    rpcUrls: {
      default: {
        http: CHAINS[5].rpcUrls,
      },
      public: {
        http: CHAINS[5].rpcUrls,
      },
    },
    id: 5,
    nativeCurrency: CHAINS[5].nativeCurrency,
  },
};

export enum ChainID {
  Ethereum = 1,
  Goerli = 5,
}

export interface Token {
  chainId: ChainID;
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  extensions?: {
    optimismBridgeAddress: Address;
  };
  balance?: BigNumberish;
  allowance?: BigNumberish;
}

// ERC-20 abi for balanceOf && allowanceOf
export const TOKEN_ABI = [
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256",
      },
    ],
    payable: false,
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export enum ErrorMessages {
  INSUFFICIENT_GAS = "You do not have enough gas to cover the transaction cost.",
}
