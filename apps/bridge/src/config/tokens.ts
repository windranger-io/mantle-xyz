// RE: https://github.com/mantlenetworkio/mantle-token-lists/blob/main/mantle.tokenlist.json
// RE: https://token-list.mantlenetwork.io/

import { Address } from 'wagmi'

enum ChainID {
  Ethereum = 1,
  Goerli = 5,
  MantleTestnet = 5001,
}

enum TokenSymbol {
  BIT = 'BIT',
  ETH = 'ETH',
  LINK = 'LINK',
  UNI = 'UNI',
  USDC = 'USDC',
  USDT = 'USDT',
  WBTC = 'WBTC',
}

interface Token {
  chainId: ChainID
  address: Address
  name: string
  symbol: `${TokenSymbol}`
  decimals: number
  logoURI: string
  extensions: {
    optimismBridgeAddress: Address
  }
}

// TODO: replace with hitting https://token-list.mantle.xyz/mantle.tokenlist.json
const MANTLE_TOKEN_LIST: {
  name: string
  logoURI: string
  keywords: Array<string>
  tokens: Array<Token>
  timestamp: string
} = {
  name: 'Mantle',
  logoURI: 'https://token-list.mantle.xyz/mantle_logo.svg',
  keywords: ['scaling', 'layer2', 'infrastructure'],
  timestamp: '2023-02-08T09:38:45.488Z',
  tokens: [
    {
      chainId: 5,
      address: '0x5a94Dc6cc85fdA49d8E9A8b85DDE8629025C42be',
      name: 'BitDAO',
      symbol: 'BIT',
      decimals: 18,
      logoURI: 'https://token-list.mantle.xyz/data/BitDAO/logo.svg',
      extensions: {
        optimismBridgeAddress: '0xe401eA8E74a58C3Bf177e2E31D11DFE6dEb452e3',
      },
    },
    {
      chainId: 5001,
      address: '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',
      name: 'BitDAO',
      symbol: 'BIT',
      decimals: 18,
      logoURI: 'https://token-list.mantle.xyz/data/BitDAO/logo.svg',
      extensions: {
        optimismBridgeAddress: '0x4200000000000000000000000000000000000010',
      },
    },
    {
      chainId: 1,
      address: '0x0000000000000000000000000000000000000000',
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
      logoURI: 'https://token-list.mantle.xyz/data/ETH/logo.svg',
      extensions: {
        optimismBridgeAddress: '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1',
      },
    },
    {
      chainId: 5,
      address: '0x0000000000000000000000000000000000000000',
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
      logoURI: 'https://token-list.mantle.xyz/data/ETH/logo.svg',
      extensions: {
        optimismBridgeAddress: '0xe401eA8E74a58C3Bf177e2E31D11DFE6dEb452e3',
      },
    },
    {
      chainId: 5001,
      address: '0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111',
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
      logoURI: 'https://token-list.mantle.xyz/data/ETH/logo.svg',
      extensions: {
        optimismBridgeAddress: '0x4200000000000000000000000000000000000010',
      },
    },
    {
      chainId: 5,
      address: '0x326C977E6efc84E512bB9C30f76E30c160eD06FB',
      name: 'Chainlink',
      symbol: 'LINK',
      decimals: 18,
      logoURI: 'https://token-list.mantle.xyz/data/LINK/logo.png',
      extensions: {
        optimismBridgeAddress: '0xe401eA8E74a58C3Bf177e2E31D11DFE6dEb452e3',
      },
    },
    {
      chainId: 5001,
      address: '0xA440ca6123C6d472F85c1f3930395664BCcd3d01',
      name: 'Chainlink',
      symbol: 'LINK',
      decimals: 18,
      logoURI: 'https://token-list.mantle.xyz/data/LINK/logo.png',
      extensions: {
        optimismBridgeAddress: '0x4200000000000000000000000000000000000010',
      },
    },
    {
      chainId: 5,
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      name: 'Uniswap',
      symbol: 'UNI',
      decimals: 18,
      logoURI: 'https://token-list.mantle.xyz/data/UNI/logo.png',
      extensions: {
        optimismBridgeAddress: '0xe401eA8E74a58C3Bf177e2E31D11DFE6dEb452e3',
      },
    },
    {
      chainId: 5001,
      address: '0x7AD75528ad538B8E28b624033DD3C10F2Ad96a37',
      name: 'Uniswap',
      symbol: 'UNI',
      decimals: 18,
      logoURI: 'https://token-list.mantle.xyz/data/UNI/logo.png',
      extensions: {
        optimismBridgeAddress: '0x4200000000000000000000000000000000000010',
      },
    },
    {
      chainId: 5,
      address: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      logoURI: 'https://token-list.mantle.xyz/data/USDC/logo.png',
      extensions: {
        optimismBridgeAddress: '0xe401eA8E74a58C3Bf177e2E31D11DFE6dEb452e3',
      },
    },
    {
      chainId: 5001,
      address: '0x2ED3c15eC59CE827c4aBBabfF76d37562558437D',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      logoURI: 'https://token-list.mantle.xyz/data/USDC/logo.png',
      extensions: {
        optimismBridgeAddress: '0x4200000000000000000000000000000000000010',
      },
    },
    {
      chainId: 5,
      address: '0xC2C527C0CACF457746Bd31B2a698Fe89de2b6d49',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      logoURI: 'https://token-list.mantle.xyz/data/USDT/logo.png',
      extensions: {
        optimismBridgeAddress: '0xe401eA8E74a58C3Bf177e2E31D11DFE6dEb452e3',
      },
    },
    {
      chainId: 5001,
      address: '0x27ee0eB6EbbcbCd4706C3291604AdC2F4384d09F',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      logoURI: 'https://token-list.mantle.xyz/data/USDT/logo.png',
      extensions: {
        optimismBridgeAddress: '0x4200000000000000000000000000000000000010',
      },
    },
    {
      chainId: 1,
      address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      name: 'Wrapped BTC',
      symbol: 'WBTC',
      decimals: 8,
      logoURI: 'https://token-list.mantle.xyz/data/WBTC/logo.svg',
      extensions: {
        optimismBridgeAddress: '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1',
      },
    },
    {
      chainId: 5,
      address: '0xC04B0d3107736C32e19F1c62b2aF67BE61d63a05',
      name: 'Wrapped BTC',
      symbol: 'WBTC',
      decimals: 8,
      logoURI: 'https://token-list.mantle.xyz/data/WBTC/logo.svg',
      extensions: {
        optimismBridgeAddress: '0xe401eA8E74a58C3Bf177e2E31D11DFE6dEb452e3',
      },
    },
    {
      chainId: 5001,
      address: '0x9155d6bFD923398D77292a2781D3E4acfD3cFFd6',
      name: 'Wrapped BTC L2',
      symbol: 'WBTC',
      decimals: 8,
      logoURI: 'https://token-list.mantle.xyz/data/WBTC/logo.svg',
      extensions: {
        optimismBridgeAddress: '0x4200000000000000000000000000000000000010',
      },
    },
  ],
}

export { MANTLE_TOKEN_LIST, ChainID, TokenSymbol }

export type { Token }
