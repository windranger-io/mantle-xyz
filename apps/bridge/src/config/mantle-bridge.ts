import {
  MANTLE_CHAIN_ID,
  MANTLE_TESTNET_CHAIN_ID,
} from 'src/config/mantle-chain'

const ONE_MINUTE = 1000 * 60
const SEVEN_DAYS = ONE_MINUTE * 60 * 24 * 7

enum MantleRelatedChain {
  MantleChainID = MANTLE_CHAIN_ID,
  MantleTestnetChainID = MANTLE_TESTNET_CHAIN_ID,
}

const getChallengePeriod = (chainID: MantleRelatedChain) => {
  if (chainID === MANTLE_CHAIN_ID) {
    return SEVEN_DAYS
  }
  if (chainID === MANTLE_TESTNET_CHAIN_ID) {
    return ONE_MINUTE
  }
  throw new Error('Invalid chain ID!')
}

export { getChallengePeriod }
