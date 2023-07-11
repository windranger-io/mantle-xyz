import { MouseEventHandler } from 'react'
import tw from 'twin.macro'
import { useTranslation } from 'next-i18next'
import Avatar from 'components/Base/Avatar'
import { shortenAddress } from 'utils/format'
import { useMounted } from 'hooks/useMounted'
import { BaseButton } from '../../../Base/Button/styles'
import { MANTLE_CHAIN_ID } from 'config/wagmi'
import { useNetwork } from 'wagmi'

import NetworkSwitch from '../NetworkSwitch'

type WalletButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  onConnectWallet: MouseEventHandler<HTMLButtonElement> | undefined
  address?: string
}

const _WalletButton = tw(BaseButton)`p-0.5`

function WalletButton({
  address,
  onClick,
  onConnectWallet,
  ...props
}: WalletButtonProps) {
  const mounted = useMounted()
  const { chain } = useNetwork()
  const connectedLabel = address && shortenAddress(address)
  const correctChain = chain?.id === MANTLE_CHAIN_ID
  // Helps to have cleaner handler
  const onClickHandler = connectedLabel ? onClick : onConnectWallet
  const { t } = useTranslation('default')
  if (!mounted) {
    return <div tw="w-[152px]"></div>
  }

  return correctChain || !connectedLabel ? (
    <_WalletButton
      variant={connectedLabel ? 'outline' : 'secondary'}
      onClick={onClickHandler}
      {...props}
      size="small"
    >
      {correctChain ? (
        <>
          {connectedLabel && (
            <span tw="mr-2.5">
              <Avatar walletAddress={connectedLabel} />
            </span>
          )}
          {connectedLabel ? (
            <span tw="mr-4">{connectedLabel}</span>
          ) : (
            <span tw="mx-4">{t('connect-wallet')}</span>
          )}
        </>
      ) : (
        <>
          {connectedLabel ? (
            <></>
          ) : (
            <span tw="mx-4">{t('connect-wallet')}</span>
          )}
        </>
      )}
    </_WalletButton>
  ) : (
    <NetworkSwitch />
  )
}

export default WalletButton
