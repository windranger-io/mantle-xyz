'use client'

import { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '../actions/Button'

type WalletModalProps = {
  children: ReactNode
  onMetamask: () => void
  onWalletConnect: () => void
}

export const WalletModal = ({
  children,
  onMetamask,
  onWalletConnect,
}: WalletModalProps) => (
  <Dialog.Root>
    <Dialog.Trigger asChild>{children}</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="bg-black/60 data-[state=open]:animate-overlayShow fixed inset-0" />
      <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
        Content here
        {/* <Dialog.Close asChild>
          <button
            className="text-violet11 hover:bg-violet4 focus:shadow-violet7 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
            aria-label="Close"
            type="button"
          >
            <Cross2Icon />
          </button>
        </Dialog.Close> */}
        <Button
          type="button"
          variant="primary"
          size="regular"
          onClick={onMetamask}
          className="flex flex-row items-center text-xs h-full text-white gap-2 backdrop-blur-[50px] bg-white/10 hover:bg-white/20 w-fit cursor-pointer"
        >
          Metamask
        </Button>
        <Button
          type="button"
          variant="primary"
          size="regular"
          onClick={onWalletConnect}
          className="flex flex-row items-center text-xs h-full text-white gap-2 backdrop-blur-[50px] bg-white/10 hover:bg-white/20 w-fit cursor-pointer"
        >
          Wallet Connect
        </Button>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
)
