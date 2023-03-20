// Configure the applications name
export const APP_NAME = "Mantle - Goerli Testnet Faucet";

// Configure which chain to use (goerli)
export const CHAIN_ID = 5;

// Configure the maximum balance the ui will mint until
export const MAX_BALANCE = 1000;

// User must tweet the following before they can mint tokens...
export const REQUIRED_TWEET =
  /To #BuildonMantle, I am claiming test \$BIT tokens on https:\/\/([^\s]+) for @0xMantle, a next generation high-performance modular @Ethereum L2 built for hyperscaled dApps.\n\nLearn more: \[https:\/\/([^\]]+)\]/;

// set the available networks token contract address (goerli)
export const NETWORKS: Record<number, `0x${string}`> = {
  5: "0x5a94Dc6cc85fdA49d8E9A8b85DDE8629025C42be",
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
    rpcUrls: ["https://goerli.infura.io/v3/9f0c70345c8d4f9ea915af6a6141cf70"],
    blockExplorerUrls: ["https://goerli.etherscan.io/"],
  },
};

// export the mintable erc20 tokens ABI
export const ABI = [
  // view methods
  "function totalSupply() view returns (uint totalSupply)",
  "function balanceOf(address who) view returns (uint balance)",
  "function allowance(address owner, address spender) view returns (uint allowance)",

  // transaction methods
  "function transfer(address to, uint value)",
  "function transferFrom(address from, address to, uint value)",
  "function approve(address spender, uint value)",
  "function mint(uint256 amount)",
  "function withdraw()",

  // events
  "event Transfer(address indexed from, address indexed to, uint value)",
  "event Approval(address indexed owner, address indexed spender, uint value)",
];

// everything by default
export default {
  APP_NAME,
  CHAIN_ID,
  MAX_BALANCE,
  REQUIRED_TWEET,
  NETWORKS,
  CHAINS,
  ABI,
};
