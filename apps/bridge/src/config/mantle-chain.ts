import { Chain } from 'wagmi';
import { BigNumber } from '@ethersproject/bignumber';
import { hexValue } from '@ethersproject/bytes';

const MANTLE_TESTNET_CHAIN_ID = 5001;

const MANTLE_CHAIN_ID = 5000;

const MANTLE_TESTNET_RPC_URL = 'https://rpc.testnet.mantle.xyz';

const MANTLE_TESTNET_BLOCK_EXPLORER_URL = 'https://explorer.testnet.mantle.xyz';

const MANTLE_TESTNET_CHAIN: Chain = {
  name: 'Mantle Testnet',
  network: 'Mantle Testnet',
  rpcUrls: {
    default: {
      http: [MANTLE_TESTNET_RPC_URL]
    },
    public: {
      http: [MANTLE_TESTNET_RPC_URL]
    }
  },
  id: MANTLE_TESTNET_CHAIN_ID,
  nativeCurrency: {
    name: 'BitDAO',
    symbol: 'BIT',
    decimals: 18
  }
};

const MANTLE_TESTNET_CHAIN_PARAMS = {
  chainName: MANTLE_TESTNET_CHAIN.name,
  chainId: hexValue(BigNumber.from(MANTLE_TESTNET_CHAIN_ID).toHexString()),
  rpcUrls: [MANTLE_TESTNET_RPC_URL],
  blockExplorerUrls: [MANTLE_TESTNET_BLOCK_EXPLORER_URL],
  nativeCurrency: MANTLE_TESTNET_CHAIN.nativeCurrency
};

export {
  MANTLE_TESTNET_CHAIN,
  MANTLE_TESTNET_CHAIN_PARAMS,
  MANTLE_TESTNET_CHAIN_ID,
  MANTLE_CHAIN_ID
};
