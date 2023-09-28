'use client'

/* eslint-disable react/jsx-no-target-blank, react/require-default-props */

import { ReactNode, useCallback, useEffect } from 'react'
// import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '../actions/Button'
import { BitgetSvg } from './Bitget'
import { BybitSvg } from './Bybit'
import { MetaMaskSvg } from './MetaMask'

import { Coin98Svg } from './Coin98'
import { RabbySvg } from './Rabby'
import { TokenPocketSvg } from './TokenPocket'
import { WalletConnectSvg } from './WalletConnect'

type WalletModalProps = {
  injectedName?: string
  connectors?: [] | { ready: boolean; id: string; name: string }[]
  onInjected?: () => void
  onMetamask?: () => void
  onWalletConnect?: () => void
  onBybitWallet?: () => void
  onBitgetWallet?: () => void
  onTokenPocket?: () => void
  onRabbyWallet?: () => void
  onCoin98Wallet?: () => void
  open: boolean
  setOpen: (open: boolean) => void
}

// this is a simplified version of @radix-ui/react-dialog so that we don't have to fight with preventDefault to get walletConnect to work
const Dialog = ({
  open,
  setOpen,
  children,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  children: ReactNode
}) => {
  // on escape close the dialog
  const escFunction = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    },
    [setOpen],
  )

  // attach globally
  useEffect(() => {
    document.addEventListener('keydown', escFunction, false)

    return () => {
      document.removeEventListener('keydown', escFunction, false)
    }
  }, [escFunction])

  return (
    <div className="w-full">
      <div
        className={open ? 'block' : 'hidden'}
        onKeyDown={event => {
          if (event.key === 'Escape') {
            setOpen(false)
          }
        }}
        role="presentation"
      >
        {/* bg overlay */}
        <div
          className="bg-black/60 backdrop-blur-sm data-[state=open]:animate-overlayShow fixed inset-0 z-[1]"
          onClick={() => {
            setOpen(false)
          }}
          role="presentation"
        />
        {/* dialog content */}
        <div className="pointer-events-auto bg-black data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[900px] translate-x-[-50%] translate-y-[-50%] rounded-[32px] p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none border border-white/20 md:px-20 px-4 md:py-10 py-5 z-[10] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

export const WalletModal = ({
  injectedName = undefined,
  connectors = [],
  onInjected = undefined,
  onMetamask = undefined,
  onWalletConnect = undefined,
  onBybitWallet = undefined,
  onBitgetWallet = undefined,
  onTokenPocket = undefined,
  onRabbyWallet = undefined,
  onCoin98Wallet = undefined,
  open = false,
  setOpen = () => {},
}: WalletModalProps) => {
  const browserWallets = connectors
    .filter(conn => conn.ready)
    .map(conn => conn.id)
  const browserWalletsNames = connectors
    .filter(conn => conn.ready)
    .map(conn => conn.name)
  const isWalletPresent = (id: string) => browserWallets.includes(id)
  // console.log('browserWallets', browserWallets, browserWalletsNames, connectors)
  const connectTo = (provider: () => void, wallet: string, url: string) => {
    if (isWalletPresent(wallet)) {
      provider()
    } else {
      window.open(url, '_blank')
    }
  }

  const otherWallets = [
    {
      id: 'bybitWallet',
      name: 'Bybit',
      provider: onBybitWallet,
      site: 'https://www.bybit.com/en-US/web3',
      icon: BybitSvg,
    },
    {
      id: 'bitgetWallet',
      name: 'Bitget',
      provider: onBitgetWallet,
      site: 'https://web3.bitget.com',
      icon: BitgetSvg,
    },
    {
      id: 'tokenPocket',
      name: 'Token Pocket',
      provider: onTokenPocket,
      site: 'https://www.tokenpocket.pro',
      icon: TokenPocketSvg,
    },
    {
      id: 'rabbyWallet',
      name: 'Rabby',
      provider: onRabbyWallet,
      site: 'https://rabby.io',
      icon: RabbySvg,
    },
    {
      id: 'coin98Wallet',
      name: 'Coin98',
      provider: onCoin98Wallet,
      site: 'https://coin98.com/wallet',
      icon: Coin98Svg,
    },
  ]
  return (
    <Dialog open={open} setOpen={setOpen}>
      <div className="relative mb-10">
        <span className="text-2xl font-medium mr-4">Connect your wallet</span>
        <div className="text-[#C4C4C4] text-sm sm:inline">
          First time with web3? Learn more on{' '}
          <a
            href="https://ethereum.org/en/wallets"
            target="_blank"
            rel="noreferrer noopener"
            className="text-[#0A8FF6]"
          >
            wallets
          </a>
        </div>
        <div className="absolute md:-right-14 -right-4 -top-1">
          <Button
            variant="ghost"
            onClick={() => {
              setOpen(false)
            }}
          >
            <svg
              width="25"
              height="26"
              viewBox="0 0 25 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.5 14.1L1.9 24.75C1.66667 24.95 1.4 25.05 1.1 25.05C0.8 25.05 0.533334 24.95 0.3 24.75C0.1 24.5167 0 24.25 0 23.95C0 23.65 0.1 23.3833 0.3 23.15L10.95 12.5L0.35 1.9C0.116667 1.7 0 1.45 0 1.15C0 0.850001 0.1 0.583334 0.3 0.35C0.533334 0.116667 0.8 0 1.1 0C1.4 0 1.66667 0.116667 1.9 0.35L12.5 11L23.1 0.35C23.3333 0.15 23.6 0.0500002 23.9 0.0500002C24.2 0.0500002 24.4667 0.15 24.7 0.35C24.9 0.583334 25 0.850001 25 1.15C25 1.45 24.9 1.71667 24.7 1.95L14.05 12.55L24.7 23.2C24.9 23.4 25 23.65 25 23.95C25 24.25 24.9 24.5 24.7 24.7C24.4667 24.9333 24.2083 25.05 23.925 25.05C23.6417 25.05 23.3833 24.9333 23.15 24.7L12.5 14.1Z"
                fill="white"
              />
            </svg>
          </Button>
        </div>
      </div>
      <div className="overflow-hidden">
        <div className="text-[#464646] text-xs mb-4">Popular</div>

        <div className="flex gap-5 mb-8">
          {onMetamask && injectedName === 'MetaMask' && (
            <Button
              key="metaMask-button"
              type="button"
              variant="outline"
              size="large"
              onClick={onMetamask}
              className="flex flex-col items-center justify-center text-sm min-h-[48px] text-white gap-2 border border-white/20 hover:bg-white/20 cursor-pointer w-[160px] h-[120px]"
            >
              <MetaMaskSvg className="h-9 w-9" />
              Metamask
            </Button>
          )}
          {onWalletConnect && (
            <Button
              key="walletConnect-button"
              type="button"
              variant="outline"
              size="large"
              onClick={onWalletConnect}
              className="flex flex-col items-center justify-center text-sm min-h-[48px] text-white gap-2 border border-white/20 hover:bg-white/20 cursor-pointer w-[160px] h-[120px] "
            >
              <WalletConnectSvg className="h-9 w-9" />
              Wallet Connect
            </Button>
          )}
          {onInjected &&
            injectedName !== 'Injected' &&
            !browserWalletsNames.includes(injectedName as string) && (
              <Button
                key="injected-button"
                type="button"
                variant="outline"
                size="large"
                onClick={onInjected}
                className="flex flex-row items-center justify-center text-sm min-h-[48px] text-white gap-2 border border-white/20 hover:bg-white/20 cursor-pointer w-[160px] h-[120px]"
              >
                {/* <MetaMaskSvg className="h-9 w-9" /> */}
                Injected: {injectedName}
              </Button>
            )}
        </div>
        <div className="text-[#464646] text-xs mb-4">Others wallets</div>
        <div className="flex gap-5 flex-wrap">
          {otherWallets
            .sort(
              (a, b) =>
                Number(isWalletPresent(b.id)) - Number(isWalletPresent(a.id)),
            )
            .map(
              wallet =>
                wallet.provider && (
                  <Button
                    key={`${wallet.id}-button`}
                    type="button"
                    variant="outline"
                    size="large"
                    onClick={() =>
                      connectTo(
                        wallet.provider as () => void,
                        wallet.id,
                        wallet.site,
                      )
                    }
                    className="flex flex-col items-center justify-center min-h-[48px] text-white gap-2  border-0 md:border md:border-white/20 hover:bg-white/20 cursor-pointer md:text-sm text-xs w-[100px] md:w-[160px] md:h-[120px] truncate"
                  >
                    <wallet.icon className="h-9 w-9" />
                    {wallet.name}
                  </Button>
                ),
            )}
        </div>
      </div>
      <p className="text-xs md:text-sm text-[#C4C4C4] max-w-[450px] text-center md:mt-10 mt-5 md:mb-0 text-center m-auto">
        By connecting your wallet, you hereby acknowledge that you have read and
        accept the{' '}
        <a
          href="https://www.mantle.xyz/terms"
          target="_blank"
          className="underline text-[#0A8FF6]"
        >
          Terms of Service
        </a>{' '}
        and{' '}
        <a
          href="https://www.mantle.xyz/privacy-policy"
          target="_blank"
          className="underline text-[#0A8FF6]"
        >
          Privacy Policy
        </a>
      </p>
    </Dialog>
  )
}
