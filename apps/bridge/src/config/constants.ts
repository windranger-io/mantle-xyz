import { BigNumberish } from "ethers";
import { Address, Chain } from "wagmi";

// these control which chains we treat as l1/l2 - the rest of the this constants doc will need to be altered for mainnet (we can $ENV most of this)
export const L1_CHAIN_ID = 5;
export const L2_CHAIN_ID = 5001;

// Configure the applications name
export const APP_NAME = "Mantle Testnet Bridge";

// Configure deta description
export const META =
  "Bridge tokens for your testnet wallet, and test your dApps deployed on Mantle Testnet.";

// Configure OG Title
export const OG_TITLE = "Bridge Your Hyperscaling Rocket Fuel";

// Configure OG Desc
export const OG_DESC =
  "Bridge your testnet assets here to start to #BuildonMantle.";

// Configure Twitter Title
export const TWITTER_TITLE = "Mantle Testnet Bridge";

// Configure Twitter Desc
export const TWITTER_DESC =
  "Bridge your testnet assets here to start to #BuildonMantle.";

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
      "http://localhost:3003";
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
  "Withdraw",
  "Withdrawn",
  "Error",
}

// Base GasFee mul HARDCODED_EXPECTED_CLAIM_FEE_IN_GAS === the approximate gasFee to call message relayer
export const HARDCODED_EXPECTED_CLAIM_FEE_IN_GAS = (800000).toString();

// url for withdraw/deposit helper api - I can't find a way to sort the query so this is less helpful than we'd like - see below:
export const BRIDGE_BACKEND =
  "https://mantle-blockscout-syncdata.testnet.mantle.xyz";

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
};

export const CHAINS_FORMATTED: Record<number, Chain> = {
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
};

export enum ChainID {
  Ethereum = 1,
  Goerli = 5,
  MantleTestnet = 5001,
}

export enum TokenSymbol {
  BIT = "BIT",
  ETH = "ETH",
  LINK = "LINK",
  UNI = "UNI",
  USDC = "USDC",
  USDT = "USDT",
  WBTC = "WBTC",
}

export interface Token {
  chainId: ChainID;
  address: Address;
  name: string;
  symbol: `${TokenSymbol}`;
  decimals: number;
  logoURI: string;
  extensions: {
    optimismBridgeAddress: Address;
  };
  balance?: BigNumberish;
  allowance?: BigNumberish;
}

// Address for multicall3 contract on each network - Multicall3: https://github.com/mds1/multicall
export const MULTICALL_CONTRACTS: Record<number, `0x${string}`> = {
  5: "0xcA11bde05977b3631167028862bE2a173976CA11",
  5001: "0xcA11bde05977b3631167028862bE2a173976CA11",
};

// ERC-20 abi for balanceOf && allowanceOf
export const TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

// TODO: replace with hitting https://token-list.mantle.xyz/mantle.tokenlist.json
export const MANTLE_TOKEN_LIST: {
  name: string;
  logoURI: string;
  keywords: Array<string>;
  tokens: Array<Token>;
  timestamp: string;
} = {
  name: "Mantle",
  logoURI: "https://token-list.mantle.xyz/mantle_logo.svg",
  keywords: ["scaling", "layer2", "infrastructure"],
  timestamp: "2023-02-08T09:38:45.488Z",
  tokens: [
    {
      chainId: 5,
      address: "0x5a94Dc6cc85fdA49d8E9A8b85DDE8629025C42be",
      name: "BitDAO",
      symbol: "BIT",
      decimals: 18,
      logoURI: "https://token-list.mantle.xyz/data/BitDAO/logo.svg",
      extensions: {
        optimismBridgeAddress: "0xc92470D7Ffa21473611ab6c6e2FcFB8637c8f330",
      },
    },
    {
      chainId: 5001,
      address: "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000",
      name: "BitDAO",
      symbol: "BIT",
      decimals: 18,
      logoURI: "https://token-list.mantle.xyz/data/BitDAO/logo.svg",
      extensions: {
        optimismBridgeAddress: "0x4200000000000000000000000000000000000010",
      },
    },
    {
      chainId: 1,
      address: "0x0000000000000000000000000000000000000000",
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
      logoURI: "https://token-list.mantle.xyz/data/ETH/logo.svg",
      extensions: {
        optimismBridgeAddress: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
      },
    },
    {
      chainId: 5,
      address: "0x0000000000000000000000000000000000000000",
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
      logoURI: "https://token-list.mantle.xyz/data/ETH/logo.svg",
      extensions: {
        optimismBridgeAddress: "0xc92470D7Ffa21473611ab6c6e2FcFB8637c8f330",
      },
    },
    {
      chainId: 5001,
      address: "0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111",
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
      logoURI: "https://token-list.mantle.xyz/data/ETH/logo.svg",
      extensions: {
        optimismBridgeAddress: "0x4200000000000000000000000000000000000010",
      },
    },
    {
      chainId: 5,
      address: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
      name: "Chainlink",
      symbol: "LINK",
      decimals: 18,
      logoURI: "/chainlink-link-logo.png",
      extensions: {
        optimismBridgeAddress: "0xc92470D7Ffa21473611ab6c6e2FcFB8637c8f330",
      },
    },
    {
      chainId: 5001,
      address: "0xA440ca6123C6d472F85c1f3930395664BCcd3d01",
      name: "Chainlink",
      symbol: "LINK",
      decimals: 18,
      logoURI: "/chainlink-link-logo.png",
      extensions: {
        optimismBridgeAddress: "0x4200000000000000000000000000000000000010",
      },
    },
    {
      chainId: 5,
      address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      name: "Uniswap",
      symbol: "UNI",
      decimals: 18,
      logoURI: "https://token-list.mantle.xyz/data/UNI/logo.png",
      extensions: {
        optimismBridgeAddress: "0xc92470D7Ffa21473611ab6c6e2FcFB8637c8f330",
      },
    },
    {
      chainId: 5001,
      address: "0x7AD75528ad538B8E28b624033DD3C10F2Ad96a37",
      name: "Uniswap",
      symbol: "UNI",
      decimals: 18,
      logoURI: "https://token-list.mantle.xyz/data/UNI/logo.png",
      extensions: {
        optimismBridgeAddress: "0x4200000000000000000000000000000000000010",
      },
    },
    {
      chainId: 5,
      address: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      logoURI: "https://token-list.mantle.xyz/data/USDC/logo.png",
      extensions: {
        optimismBridgeAddress: "0xc92470D7Ffa21473611ab6c6e2FcFB8637c8f330",
      },
    },
    {
      chainId: 5001,
      address: "0x2ED3c15eC59CE827c4aBBabfF76d37562558437D",
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      logoURI: "https://token-list.mantle.xyz/data/USDC/logo.png",
      extensions: {
        optimismBridgeAddress: "0x4200000000000000000000000000000000000010",
      },
    },
    {
      chainId: 5,
      address: "0xC2C527C0CACF457746Bd31B2a698Fe89de2b6d49",
      name: "Tether USD",
      symbol: "USDT",
      decimals: 6,
      logoURI: "/tether-usdt-logo.png",
      extensions: {
        optimismBridgeAddress: "0xc92470D7Ffa21473611ab6c6e2FcFB8637c8f330",
      },
    },
    {
      chainId: 5001,
      address: "0x27ee0eB6EbbcbCd4706C3291604AdC2F4384d09F",
      name: "Tether USD",
      symbol: "USDT",
      decimals: 6,
      logoURI: "/tether-usdt-logo.png",
      extensions: {
        optimismBridgeAddress: "0x4200000000000000000000000000000000000010",
      },
    },
    {
      chainId: 1,
      address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      name: "Wrapped BTC",
      symbol: "WBTC",
      decimals: 8,
      logoURI: "https://token-list.mantle.xyz/data/WBTC/logo.svg",
      extensions: {
        optimismBridgeAddress: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
      },
    },
    {
      chainId: 5,
      address: "0xC04B0d3107736C32e19F1c62b2aF67BE61d63a05",
      name: "Wrapped BTC",
      symbol: "WBTC",
      decimals: 8,
      logoURI: "https://token-list.mantle.xyz/data/WBTC/logo.svg",
      extensions: {
        optimismBridgeAddress: "0xc92470D7Ffa21473611ab6c6e2FcFB8637c8f330",
      },
    },
    {
      chainId: 5001,
      address: "0x9155d6bFD923398D77292a2781D3E4acfD3cFFd6",
      name: "Wrapped BTC L2",
      symbol: "WBTC",
      decimals: 8,
      logoURI: "https://token-list.mantle.xyz/data/WBTC/logo.svg",
      extensions: {
        optimismBridgeAddress: "0x4200000000000000000000000000000000000010",
      },
    },
  ],
};
