'use client'

import Link from 'next/link'

import CONST from '@mantle/constants'
import { MantleLockUp } from '../base/Icons'
import { Links } from '../actions/Links'

export const NavigationLite = ({
  walletConnect,
}: {
  walletConnect: React.ReactNode
}) => {
  return (
    <header className="relative  ">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Mantle</span>

            <MantleLockUp className="h-8 w-auto " />
          </Link>
        </div>
        <div className="flex gap-10">
          <Links
            href={CONST.RESOURCE_LINKS.BRIDGE_LINK}
            rel="noreferrer noopener"
            target="_blank"
            className="text-type-secondary hover:text-type-primary  transition ease-in-out duration-300 cursor-pointer"
          >
            Bridge
          </Links>

          <Links href="/" className="text-type-primary cursor-pointer relative">
            Faucet
            <div className="rounded-full bg-white h-1 w-1  absolute left-[50%]" />
          </Links>
          <Links
            href={CONST.RESOURCE_LINKS.DOC_LINK}
            rel="noreferrer noopener"
            target="_blank"
            className="text-type-secondary hover:text-type-primary  transition ease-in-out duration-300 cursor-pointer"
          >
            Docs
          </Links>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {walletConnect}
        </div>
      </nav>
    </header>
  )
}
