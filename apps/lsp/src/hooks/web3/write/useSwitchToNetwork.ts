'use client'

import { CHAINS } from '@config/constants'
import { useToast } from '@hooks/useToast'

import { useSwitchNetwork } from 'wagmi'

declare global {
  interface Window {
    ethereum: import('ethers').providers.ExternalProvider
  }
}

export function useSwitchToNetwork() {
  const { switchNetwork } = useSwitchNetwork()

  // create an error toast if required
  const { updateToast } = useToast()

  // trigger addNetwork
  const addNetwork = async (chainId: number) => {
    if (!window.ethereum) throw new Error('No crypto wallet found')
    // add the woollyhat network to users wallet
    await window.ethereum.request?.({
      method: 'wallet_addEthereumChain',
      params: [CHAINS[chainId]],
    })
  }

  // trigger change of network
  const switchToNetwork = async (chainId: number): Promise<number | void> => {
    // we should req this via wagmi
    // if (!window.ethereum) throw new Error("No crypto wallet found");
    try {
      switchNetwork?.(chainId)
      return chainId
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError && switchError.code === 4902) {
        await addNetwork(chainId)
      } else if (switchError.code !== -32000) {
        updateToast({
          id: 'switch-error',
          content: 'Error: Unable to switch chains',
          type: 'error',
          borderLeft: 'red-600',
        })
      }
    }
    return Promise.resolve()
  }

  return {
    addNetwork,
    switchToNetwork,
  }
}
