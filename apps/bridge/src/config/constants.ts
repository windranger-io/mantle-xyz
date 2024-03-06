import { BigNumberish } from "ethers";
import { Address, Chain } from "wagmi";

// these control which chains we treat as l1/l2 - the rest of the this constants doc will need to be altered for mainnet (we can $ENV most of this)
export const L1_CHAIN_ID =
  parseInt(process.env.NEXT_PUBLIC_L1_CHAIN_ID || "0", 10) || 5;
export const L2_CHAIN_ID =
  parseInt(process.env.NEXT_PUBLIC_L2_CHAIN_ID || "0", 10) || 5001;

export const IS_MANTLE_V2 = process.env.NEXT_PUBLIC_IS_MANTLE_V2 === "true";

// Configure the applications name
export const APP_NAME = `Mantle${
  L2_CHAIN_ID === 5001 ? " Testnet" : ""
} Bridge`;

// Configure deta description
export const META = `Bridge tokens for your ${
  L2_CHAIN_ID === 5001 ? "testnet" : "mainnet"
} wallet, and test your dApps deployed on Mantle${
  L2_CHAIN_ID === 5001 ? " Testnet" : " Mainnet"
}.`;

// Configure OG Title
export const OG_TITLE = "Bridge Your Hyperscaling Rocket Fuel";

// Configure OG Desc
export const OG_DESC = `Bridge your ${
  L2_CHAIN_ID === 5001 ? "testnet" : "mainnet"
} assets here to start to #BuildonMantle.`;

// Configure Twitter Title
export const TWITTER_TITLE = `Mantle${
  L2_CHAIN_ID === 5001 ? " Testnet" : ""
} Bridge`;

// Configure Twitter Desc
export const TWITTER_DESC = `Bridge your ${
  L2_CHAIN_ID === 5001 ? "testnet" : "mainnet"
} assets here to start to #BuildonMantle.`;

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
      ? `https://${
          L1_CHAIN_ID === 1 ? "bridge.mantle.xyz" : "bridge.testnet.mantle.xyz"
        }`
      : // this should match the port used by the current app
        "http://localhost:3003")
  );
}

// export the absolute path
export const ABSOLUTE_PATH = getBaseUrl();

// Available views - were serving this as a spa atm
export enum Views {
  "Default" = 1,
  "Account",
}

// Available directions for the transfer to move
export enum Direction {
  "Deposit" = 1,
  "Withdraw",
}

// Available Page states for the CTA Modal
export enum CTAPages {
  "Default" = 1,
  "Loading",
  "Deposit",
  "Deposited",
  "Withdraw",
  "Withdrawn",
  "Error",
}

export enum WithdrawStatus {
  "INIT" = 1,
  "SENDING_TX",
  "READY_TO_PROVE",
  "IN_CHALLENGE_PERIOD",
  "READY_FOR_RELAY",
  "RELAYED",
}

// Base GasFee mul HARDCODED_EXPECTED_CLAIM_FEE_IN_GAS === the approximate gasFee to call message relayer
export const HARDCODED_EXPECTED_CLAIM_FEE_IN_GAS = (800000).toString();

// url for withdraw/deposit helper api - I can't find a way to sort the query so this is less helpful than we'd like - see below:
export const BRIDGE_BACKEND =
  L2_CHAIN_ID === 5001
    ? "https://mantle-blockscout-syncdata.testnet.mantle.xyz"
    : "https://mantle-syncdata.mantle.xyz";

// how many items to include in the accounts history pages (the sort direction returned from the api means that the oldest entries are
// on the lowest page numbers (bad)) once we've got the returned sort order under control we can reduce this back to a sensible default
// and "load more" items
export const HISTORY_ITEMS_PER_PAGE = Number.MAX_SAFE_INTEGER; // for now we're just going to use js max and fetch everything every time

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
  5000: {
    chainId: "0x1388",
    chainName: "Mantle Mainnet",
    nativeCurrency: {
      name: "Mantle",
      symbol: "MNT",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.mantle.xyz"],
    blockExplorerUrls: ["https://explorer.mantle.xyz/"],
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
      // infura backed redirect gateway
      `${ABSOLUTE_PATH}/rpc`,
      // public gateway
      `https://ethereum-goerli-rpc.publicnode.com`,
    ],
    blockExplorerUrls: ["https://goerli.etherscan.io/"],
  },
  // same for Mantle TestNet
  5001: {
    chainId: "0x1389",
    chainName: "Mantle Testnet",
    nativeCurrency: {
      name: "Mantle",
      symbol: "MNT",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.testnet.mantle.xyz"],
    blockExplorerUrls: ["https://explorer.testnet.mantle.xyz/"],
  },
  // sepolia
  11155111: {
    chainId: "0xaa36a7",
    chainName: "Sepolia",
    nativeCurrency: {
      name: "sepoliaETH",
      symbol: "sepoliaETH",
      decimals: 18,
    },
    rpcUrls: [
      "https://eth-sepolia.g.alchemy.com/v2/XMS1J6f654XZolfd7oaMe-kaNPEpWifX",
    ],
    blockExplorerUrls: ["https://sepolia.etherscan.io/"],
  },
  // mantle sepolia
  5003: {
    chainId: "0x138b",
    chainName: "Mantle Sepolia",
    nativeCurrency: {
      name: "Mantle",
      symbol: "MNT",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.sepolia.mantle.xyz"],
    blockExplorerUrls: ["https://explorer.sepolia.mantle.xyz/"],
    // rpcUrls: ["https://op-geth-sepolia.qa.gomantle.org"],
    // blockExplorerUrls: [
    //   "https://explorer-fronted-sepolia-qa2.qa.gomantle.org/",
    // ],
  },
};

export const CHAINS_FORMATTED: Record<number, Chain> = {
  1: {
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
  5000: {
    name: CHAINS[5000].chainName,
    network: CHAINS[5000].chainName,
    rpcUrls: {
      default: {
        http: [CHAINS[5000].rpcUrls[0]],
      },
      public: {
        http: [CHAINS[5000].rpcUrls[0]],
      },
    },
    id: 5000,
    nativeCurrency: CHAINS[5000].nativeCurrency,
  },
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
  5001: {
    name: CHAINS[5001].chainName,
    network: CHAINS[5001].chainName,
    rpcUrls: {
      default: {
        http: [CHAINS[5001].rpcUrls[0]],
      },
      public: {
        http: [CHAINS[5001].rpcUrls[0]],
      },
    },
    id: 5001,
    nativeCurrency: CHAINS[5001].nativeCurrency,
  },
  // sepolia
  11155111: {
    testnet: true,
    name: CHAINS[11155111].chainName,
    network: CHAINS[11155111].chainName,
    rpcUrls: {
      default: {
        http: [CHAINS[11155111].rpcUrls[0]],
      },
      public: {
        http: [CHAINS[11155111].rpcUrls[0]],
      },
    },
    id: 11155111,
    nativeCurrency: CHAINS[11155111].nativeCurrency,
  },
  // mantle sepolia
  5003: {
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

export enum ChainID {
  Mainnet = 1,
  Mantle = 5000,
  Goerli = 5,
  MantleTestnet = 5001,
  MantleSepolia = 5003,
  Sepolia = 11155111,
}

export interface Token {
  chainId: ChainID;
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  extensions: {
    optimismBridgeAddress: Address;
  };
  balance?: BigNumberish;
  allowance?: BigNumberish;
}

export interface TokenList {
  name: string;
  logoURI: string;
  keywords: Array<string>;
  tokens: Array<Token>;
  timestamp: string;
}

// source of truth for token list
export const MANTLE_TOKEN_LIST_URL =
  "https://token-list.mantle.xyz/mantle.tokenlist.json";

// Address for multicall3 contract on each network - Multicall3: https://github.com/mds1/multicall
export const MULTICALL_CONTRACTS: Record<number, string> = {
  1: "0xcA11bde05977b3631167028862bE2a173976CA11",
  5000: "0x9155FcC40E05616EBFf068446136308e757e43dA",
  5: "0xcA11bde05977b3631167028862bE2a173976CA11",
  5001: "0xcA11bde05977b3631167028862bE2a173976CA11",
  11155111: "0xcA11bde05977b3631167028862bE2a173976CA11",
  5003: "0x783983D4FE933F52C79E179301Bc293508dfea19",
};

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

// special case usdt
export const USDT_APPROVE_ABI = [
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "_spender", type: "address" },
      { internalType: "address", name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const MANTLE_MIGRATOR_URL = "https://migratebit.mantle.xyz";
export const MANTLE_MIGRATOR_HISTORY_PATH = "/account/migrate";
export const MANTLE_MIGRATOR_V2_HISTORY_PATH = "/account/migratev2";

export const DELEGATION_URL: string = "https://delegatevote.mantle.xyz/";

export const MANTLE_BRIDGE_URL: Record<number, string> = {
  1: "https://bridge.mantle.xyz",
  5: "https://bridge.testnet.mantle.xyz",
};

export const MANTLE_JOURNEY_URL = "https://journey.mantle.xyz";

export type WithdrawHash = {
  init: string;
  prove: string;
  claim: string;
};
