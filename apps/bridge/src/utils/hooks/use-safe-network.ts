import { useNetwork, Chain } from 'wagmi'

type ChainType = {
  chains: Chain[]
  chain: Chain & {
    unsupported?: boolean | undefined
  }
}

const useSafeNetwork = (): ChainType => {
  const { chain, ...rest } = useNetwork()

  if (chain === undefined) {
    throw new Error('Something went wrong!')
  }

  // TODO: improve UX
  if (chain.unsupported) {
    throw new Error('Unsupported chain!')
  }

  return {
    chain,
    ...rest,
  }
}

export default useSafeNetwork
