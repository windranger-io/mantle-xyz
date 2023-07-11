import Button from 'components/Base/Button'
import { useTranslation } from 'next-i18next'
import {
  MetaMaskIcon,
  WalletConnectIcon,
  CrossCircleIcon,
} from 'components/Base/Icons'
import { ModalContainer } from 'components/Modals/styles'

import { ModalScreenProps } from '../Modal/ModalManager'

function SelectWalletConnector({ next, setShow }: ModalScreenProps) {
  const { t } = useTranslation('default')
  return (
    <ModalContainer>
      <div tw="flex flex-col items-end mx-4">
        <Button variant="hero" onClick={() => setShow(false)}>
          <CrossCircleIcon tw="h-10 w-10 hover:opacity-80" />
        </Button>
      </div>
      <h3 tw="mx-20 mb-8 font-normal text-color-white text-2xl border-b border-color-white pb-4 mt-2.5">
        {t('connect-your-wallet', 'Connect your Wallet')}
      </h3>
      <div tw="flex-grow px-20">
        <Button
          variant="primary"
          full
          rounded
          tw="mb-7"
          size="large"
          onClick={() => next({ connectorId: 'metaMask' })}
        >
          <MetaMaskIcon size="lg" />
          <span>METAMASK</span>
        </Button>
        <Button
          variant="primary"
          full
          rounded
          size="large"
          onClick={() => next({ connectorId: 'walletConnect' })}
        >
          <WalletConnectIcon size="lg" />
          <span>WALLETCONNECT</span>
        </Button>
      </div>
      <a tw="text-center text-sm font-light text-color-white underline">
        {/* {t('no-wallet-help-text')} */}
      </a>
    </ModalContainer>
  )
}

export default SelectWalletConnector
