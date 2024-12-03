/* eslint-disable @typescript-eslint/dot-notation */
import { BigNumberish } from "ethers";
import { Address, Chain } from "wagmi";

// TODO: refactor this file

// these control which chains we treat as l1/l2 - the rest of the this constants doc will need to be altered for mainnet (we can $ENV most of this)
export const L1_CHAIN_ID = +(process.env["NEXT_PUBLIC_L1_CHAIN_ID"] || "1");
export const L2_CHAIN_ID = +(process.env["NEXT_PUBLIC_L2_CHAIN_ID"] || "5000");

// export the conversion rate
export const CONVERSION_RATE = 1;

export const L1_NFT_ADDRESSES: Record<number, `0x${string}`> = {
  1: "0x5280F0Ec2fDbf7c043A63215f1394D97DA3DF5E0",
  5: "0x7152A9E0858Bb1954884c09a5C02a716c21A5EAf",
};

export const L1_NFT_ADDRESS = L1_NFT_ADDRESSES[L1_CHAIN_ID];

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

// Use L1 NFT contract
export const L1_NFT_CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_receiver",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_quantity",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_currency",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_pricePerToken",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "bytes32[]",
            name: "proof",
            type: "bytes32[]",
          },
          {
            internalType: "uint256",
            name: "quantityLimitPerWallet",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "pricePerToken",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "currency",
            type: "address",
          },
        ],
        internalType: "struct IDrop.AllowlistProof",
        name: "_allowlistProof",
        type: "tuple",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "claim",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
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
export const APP_NAME = "Chivalries of Mantle | Mantle Network";

// Configure deta description
export const META =
  "With Mantle Network, an Ethereum rollup, Mantle Treasury, and a token holder governed roadmap for products and initiatives.";

// Configure OG Title
export const OG_TITLE =
  "Mantle | Mass Adoption of Decentralized and Token-Governed Technologies";

// Configure OG Desc
export const OG_DESC =
  "With Mantle Network, an Ethereum rollup, Mantle Treasury, and a token holder governed roadmap for products and initiatives.";

// Configure Twitter Title
export const TWITTER_TITLE =
  "Mantle | Mass Adoption of Decentralized and Token-Governed Technologies";

// Configure Twitter Desc
export const TWITTER_DESC =
  "With Mantle Network, an Ethereum rollup, Mantle Treasury, and a token holder governed roadmap for products and initiatives.";

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
      ? L1_CHAIN_ID === 1
        ? `http://charity.mantle.xyz`
        : process.env.NEXT_PUBLIC_SITE_URL
      : // this should match the port used by the current app
        "http://localhost:3009")
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
      `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ETH_MAINNET_KEY}`,
      // infura backed redirect gateway
      // `${ABSOLUTE_PATH}/rpc`,
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
      `https://goerli.infura.io/v3/${process.env.NEXT_PUBLIC_GOERLI_KEY}`,
      // infura backed redirect gateway
      // `${ABSOLUTE_PATH}/rpc`,
      // public gateway
      `https://rpc.ankr.com/eth_goerli`,
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

export const MANTLE_BRIDGE_URL: Record<number, string> = {
  1: "https://app.mantle.xyz/bridge",
  5: "https://app.mantle.xyz/bridge",
};

export const DELEGATION_URL: string = "https://delegatevote.mantle.xyz/";

export enum ErrorMessages {
  INSUFFICIENT_GAS = "You do not have enough gas to cover the transaction cost.",
  HALTED = "Migration halted. See forum post ",
}

export const migrationPolicyUrl =
  "https://forum.mantle.xyz/t/clarification-of-bit-to-mnt-migration-policy-and-service/7877";

export const maxCharityNFTSupplies: Record<number, number> = {
  1: 100,
  5: 30,
};

export const maxCharityNFTSupply = maxCharityNFTSupplies[L1_CHAIN_ID];
