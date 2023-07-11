import { ethers, providers } from 'ethers'
import { useTranslation } from 'next-i18next'

import { useEffect, useMemo, useState } from 'react'
import { useConnect } from 'wagmi'

import Button from 'components/Base/Button'
import { ModalScreenProps } from '../Modal/ModalManager'

import { useToast } from 'hooks/useToast'
import { useHandleError } from 'hooks/useHandleError'

import { ModalContainer } from 'components/Modals/styles'
import { CrossCircleIcon } from 'components/Base/Icons'

import { MANTLE_CHAIN_ID, MANTLE_CHAIN_PARAMS } from 'config/wagmi'

export function AcceptTerms({ passProps, setShow }: ModalScreenProps) {
  const { t } = useTranslation('default')
  // get basic injected provider
  const [provider, setProvider] = useState({} as ethers.providers.Web3Provider)

  const { createToast } = useToast()
  const handleError = useHandleError()
  const { connectAsync, connectors, error, isLoading, pendingConnector } =
    useConnect()
  const id = passProps.connectorId

  // Find the right connector by ID
  const connector = useMemo(
    () => connectors.find((connector) => connector.id === id),
    [id, connectors]
  )

  // set injected provided
  useEffect(() => {
    window.ethereum &&
      setProvider(
        new ethers.providers.Web3Provider(
          window.ethereum as providers.ExternalProvider
        )
      )
  }, [])

  const handleConnect = async () => {
    try {
      // connect wallet
      await connectAsync({ connector })
      // add the mantle network to users wallet
      await provider.send('wallet_addEthereumChain', [MANTLE_CHAIN_PARAMS])
      // switch to mantle network
      await connector?.switchChain?.(MANTLE_CHAIN_ID)
      // hurrah!
      createToast({
        content: 'Wallet successfully connected',
        type: 'success',
        id: 'success-connect-wallet-' + Math.floor(Math.random() * 10 ** 8),
      })
    } catch (err) {
      handleError(err)
    } finally {
      setShow(false)
    }
  }

  const isConnecting = isLoading && connector?.id === pendingConnector?.id

  return (
    <ModalContainer>
      <div tw="flex flex-col items-end mx-4">
        <Button variant="hero" onClick={() => setShow(false)}>
          <CrossCircleIcon tw="h-10 w-10 hover:opacity-80" />
        </Button>
      </div>
      <h3 tw="mx-20 mb-8 font-normal text-color-white text-2xl border-b border-color-white pb-4 mt-2.5">
        {t('modal-terms')}
      </h3>
      <div tw=" flex-row flex-grow px-20 justify-between align-top">
        <div tw="flex justify-between items-center">
          <p tw="text-color-white">View terms of services</p>
          <a href={'/terms'} rel="noreferrer noopener" target="_blank">
            <Button variant="hero" rounded size="small">
              {t('modal-view')}
            </Button>
          </a>
        </div>
      </div>
      <div tw="px-20">
        <Button
          variant="primary"
          size="large"
          full
          onClick={handleConnect}
          disabled={!connector?.ready || isConnecting}
          tw="my-4"
        >
          {isConnecting
            ? `${t('modal-wallet-connecting')}`
            : `${t('modal-wallet-accept')}`}
        </Button>

        <p tw="text-center text-sm text-color-white">
          {t('modal-accept-terms')}
        </p>

        {error && <div>{error.message}</div>}
      </div>
    </ModalContainer>
  )
}

export default AcceptTerms
