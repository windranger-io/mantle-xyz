'use client'

/* eslint-disable react/jsx-no-target-blank */

import { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '../actions/Button'
import { MetaMaskSvg } from './MetaMask'

type WalletModalProps = {
  children: ReactNode
  onMetamask: () => void
}

export const WalletModal = ({ children, onMetamask }: WalletModalProps) => (
  <Dialog.Root>
    <Dialog.Trigger asChild>{children}</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="bg-black/60 backdrop-blur-sm data-[state=open]:animate-overlayShow fixed inset-0" />
      <Dialog.Content className="bg-black data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[403px] translate-x-[-50%] translate-y-[-50%] rounded-[32px] p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none border border-white/20 px-12 py-14">
        <p className="text-2xl pb-6 mb-6 border-b border-white/20">
          Connect your wallet
        </p>
        <Button
          type="button"
          variant="secondary"
          size="regular"
          onClick={onMetamask}
          className="flex flex-row items-center justify-center text-base min-h-[48px] text-white gap-2 backdrop-blur-[50px] bg-white/10 hover:bg-white/20 cursor-pointer w-full"
        >
          <MetaMaskSvg className="h-6 w-6" />
          Metamask
        </Button>
        <p className="text-sm mt-6">
          By connecting your wallet, you hereby acknowledge that you have read
          and accept the{' '}
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
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
)
