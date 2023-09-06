'use client'

import { useContext } from 'react'
import { useConnect } from 'wagmi'

import StateContext from '@providers/stateContext'
import dynamic from 'next/dynamic'

// set the walletModal up as a dynamic container
const DynamicWalletModal = dynamic(
  async () => {
    const { WalletModal } = await import('@mantle/ui')
    return WalletModal
  },
  {
    ssr: false,
  },
)

export default function WalletProvider() {
  // unpack the context
  const { chainId, client, setClient, walletModalOpen, setWalletModalOpen } =
    useContext(StateContext)

  // control wagmi connector
  const { connect, connectors } = useConnect({
    onSuccess() {
      setWalletModalOpen(false)
    },
  })

  // check for injected connector
  const hasInjected = connectors.find(conn => conn.id === 'injected')

  return (
    <DynamicWalletModal
      open={walletModalOpen}
      setOpen={setWalletModalOpen}
      injectedName={hasInjected?.name?.replace(/Injected\s\(([^)]+)\)/, '$1')}
      onInjected={
        hasInjected && hasInjected.name !== 'Injected (MetaMask)'
          ? () => {
              setClient({
                ...client,
                connector: 'injected',
              })
              connect({
                chainId,
                connector: hasInjected,
              })
            }
          : undefined
      }
      onMetamask={() => {
        setClient({
          ...client,
          connector: 'metaMask',
        })
        connect({
          connector: connectors.find(conn => conn.id === 'metaMask'),
        })
      }}
      onWalletConnect={() => {
        setClient({
          ...client,
          connector: 'walletConnect',
        })
        connect({
          chainId,
          connector: connectors.find(conn => conn.id === 'walletConnect'),
        })
      }}
    />
  )
}
