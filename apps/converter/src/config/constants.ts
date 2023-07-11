/* eslint-disable @typescript-eslint/dot-notation */
import { BigNumberish } from "ethers";
import { Address, Chain } from "wagmi";

// these control which chains we treat as l1/l2 - the rest of the this constants doc will need to be altered for mainnet (we can $ENV most of this)
export const L1_CHAIN_ID = +(process.env["NEXT_PUBLIC_L1_CHAIN_ID"] || "1");
export const L2_CHAIN_ID = +(process.env["NEXT_PUBLIC_L2_CHAIN_ID"] || "5000");

// export the conversion rate
export const CONVERSION_RATE = 1;

export const L1_BITDAO_TOKEN_ADDRESSES: Record<number, `0x${string}`> = {
  1: "0x1A4b46696b2bB4794Eb3D4c26f1c55F9170fa4C5",
  5: "0x5a94Dc6cc85fdA49d8E9A8b85DDE8629025C42be",
};

export const L1_MANTLE_TOKEN_ADDRESSES: Record<number, `0x${string}`> = {
  1: "0x3c3a81e81dc49a522a592e7622a7e711c06bf354",
  5: "0xc1dC2d65A2243c22344E725677A3E3BEBD26E604",
};

export const L1_CONVERTER_CONTRACT_ADDRESSES: Record<number, `0x${string}`> = {
  1: "0xfFb94c81D9A283aB4373ab4Ba3534DC4FB8d1295",
  5: "0x144D9B7F34a4e3133C6F347886fBe2700c4cb268",
};

// Migrate BitDAO tokens to Mantle tokens on L1
export const L1_BITDAO_TOKEN_ADDRESS = L1_BITDAO_TOKEN_ADDRESSES[L1_CHAIN_ID];
export const L1_MANTLE_TOKEN_ADDRESS = L1_MANTLE_TOKEN_ADDRESSES[L1_CHAIN_ID];
export const L1_CONVERTER_CONTRACT_ADDRESS =
  L1_CONVERTER_CONTRACT_ADDRESSES[L1_CHAIN_ID];

// Use L1 Converter contract to carryout the conversion
export const L1_CONVERTER_CONTRACT_ABI = [
  "function migrateBIT(uint256 _amount)",
  "function migrateAllBIT()",
  "function halted() view returns (bool)",
];

// Token constructs for dummy contracts on goerli
export const L1_BITDAO_TOKEN: Token = {
  chainId: 5,
  address: L1_BITDAO_TOKEN_ADDRESS,
  name: "BitDAO",
  symbol: "BIT",
  decimals: 18,
  logoURI: "/bitdao.svg",
};

export const L1_MANTLE_TOKEN: Token = {
  chainId: 5,
  address: L1_MANTLE_TOKEN_ADDRESS,
  name: "Mantle",
  symbol: "MNT",
  decimals: 18,
  logoURI: "/mantle.svg",
};

// Configure the applications name
export const APP_NAME = "Mantle Migrator";

// Configure deta description
export const META = "Migrate $BIT tokens to $MNT tokens - 1:1";

// Configure OG Title
export const OG_TITLE = "Migrate $BIT tokens to $MNT tokens";

// Configure OG Desc
export const OG_DESC =
  "Migrate $BIT tokens to $MNT tokens here... #BuildonMantle.";

// Configure Twitter Title
export const TWITTER_TITLE = "Mantle Migrator";

// Configure Twitter Desc
export const TWITTER_DESC =
  "Migrate $BIT tokens to $MNT tokens here... #BuildonMantle.";

// Get the current absolute path from the env
export function getBaseUrl() {
  const vercel =
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    process.env.NEXT_PUBLIC_SITE_URL ??
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    process.env.NEXT_PUBLIC_VERCEL_URL;
  // return the fully resolved absolute url
  return vercel
    ? `https://${vercel}`
    : // this should match the port used by the current app
      "http://localhost:3004";
}

// export the absolute path
export const ABSOLUTE_PATH = getBaseUrl();

// Available views - were serving this as a spa atm
export enum Views {
  "Default" = 1,
  "Account",
}

// Available Page states for the CTA Modal
export enum CTAPages {
  "Terms" = 1,
  "Default",
  "Loading",
  "Converted",
  "Error",
}

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
      // eslint-disable-next-line @typescript-eslint/dot-notation
      `https://mainnet.infura.io/v3/${process.env["NEXT_PUBLIC_INFURA_API_KEY"]}`,
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
      // eslint-disable-next-line @typescript-eslint/dot-notation
      `https://goerli.infura.io/v3/${process.env["NEXT_PUBLIC_INFURA_API_KEY"]}`,
    ],
    blockExplorerUrls: ["https://goerli.etherscan.io/"],
  },
  // same for Mantle TestNet
  5001: {
    chainId: "0x1389",
    chainName: "Mantle Testnet",
    nativeCurrency: {
      name: "BitDAO",
      symbol: "BIT",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.testnet.mantle.xyz"],
    blockExplorerUrls: ["https://explorer.testnet.mantle.xyz/"],
  },
  5000: {
    chainId: "0x1389",
    chainName: "Mantle Mainnet",
    nativeCurrency: {
      name: "Mantle",
      symbol: "MNT",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.mantle.xyz"],
    blockExplorerUrls: ["https://explorer.mantle.xyz/"],
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
  5001: {
    name: CHAINS[5001].chainName,
    network: CHAINS[5001].chainName,
    rpcUrls: {
      default: {
        http: CHAINS[5001].rpcUrls,
      },
      public: {
        http: CHAINS[5001].rpcUrls,
      },
    },
    id: 5001,
    nativeCurrency: CHAINS[5001].nativeCurrency,
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
};

export enum ChainID {
  Ethereum = 1,
  Goerli = 5,
  MantleTestnet = 5001,
  Mantle = 5000,
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

// Address for multicall3 contract on each network - Multicall3: https://github.com/mds1/multicall
export const MULTICALL_CONTRACTS: Record<number, `0x${string}`> = {
  1: "0xcA11bde05977b3631167028862bE2a173976CA11",
  5: "0xcA11bde05977b3631167028862bE2a173976CA11",
  5001: "0xcA11bde05977b3631167028862bE2a173976CA11",
};

// ERC-20 abi for balanceOf && allowanceOf
export const TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

export const MANTLE_BRIDGE_URL: Record<number, string> = {
  1: "https://bridge.mantle.xyz",
  5: "https://bridge.testnet.mantle.xyz",
};

export const DELEGATION_URL: string = "https://delegatevote.mantle.xyz/";

export enum ErrorMessages {
  INSUFFICIENT_GAS = "You do not have enough gas to cover the transaction cost.",
  HALTED = "Migration halted. Please check again later.",
}

export const isComingSoon =
  process.env.NEXT_PUBLIC_IS_COMING_SOON === "true" || false;
