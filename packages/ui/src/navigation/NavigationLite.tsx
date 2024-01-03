'use client'

import Link from 'next/link'
import CONST from '@mantle/constants'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { MantleLogoIcon, MantleLogo } from '../base/Icons'

import { mobileNavCat } from './styles'
import { MantleLink } from '../links/MantleLinks'

export type NavItem = {
  name: string
  href: string
  internal: boolean
  key: string
}

export const NavigationLite = ({
  walletConnect,
  activeKey,
  mobileMenuOpen,
  setMobileMenuOpen,
  navItems,
}: {
  walletConnect: React.ReactNode
  activeKey: string
  mobileMenuOpen: boolean
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
  navItems: NavItem[]
}) => {
  const [isTestnet, setIsTestnet] = useState(false)
  const gtag = (window as any)?.gtag
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const host = window?.location.host
        setIsTestnet(host.indexOf('testnet') > -1)
      }
    } catch (e) {
      console.log(e)
    }
  }, [])

  return (
    <div className="relative">
      <nav
        className="mx-auto  max-w-7xl  p-4 lg:px-8 items-center grid grid-cols-2 lg:flex"
        aria-label="Global"
      >
        <div className="flex">
          <Link
            href={CONST.WEBSITE}
            rel="noreferrer noopener"
            target="_blank"
            className="-m-1.5 p-1.5"
          >
            <span className="sr-only">Mantle</span>

            <MantleLogo />
          </Link>
        </div>
        <div className="hidden lg:flex justify-center gap-6 xl:gap-12 lg:grow">
          {navItems.map((item, index) => {
            const isActive = activeKey === item.key
            return (
              <span key={`navLink-${item?.name || index}`}>
                <MantleLink
                  onClick={() =>
                    gtag('event', 'header_bridge_click', {
                      tab: item.name,
                      network: isTestnet ? 'testnet' : 'mainnet',
                    })
                  }
                  variant="navLink"
                  href={item.href}
                  target={item.internal ? '_self' : '_blank'}
                  rel="noreferrer noopener"
                  className={
                    isActive
                      ? 'text-type-primary relative select-none pointer-events-none'
                      : ``
                  }
                >
                  {item.name}
                  {/* Add dot if current site  */}
                  {isActive && (
                    <div className="rounded-full bg-white h-1 w-1  absolute left-[50%] -bottom-[10px]" />
                  )}
                </MantleLink>
              </span>
            )
          })}
        </div>

        <div className="flex justify-end gap-10">
          <div className="grid hidden lg:block">{walletConnect}</div>
          <div className="grid lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon
                className="h-8 w-8 text-type-secondary hover:text-type-primary transition ease-in-out duration-300"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </nav>
      <Dialog
        as="div"
        className={clsx('lg:hidden ')}
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-10" />

        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto backdrop-blur-[50px] bg-black/30 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Mantle</span>
              <MantleLogoIcon className="h-8 w-auto" />
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon
                className="h-8 w-8 text-type-secondary hover:text-type-primary transition ease-in-out duration-300"
                aria-hidden="true"
              />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-4 py-6 pl-4 ">
                {navItems.map((item, index) => (
                  <span key={`navLink-${item?.name || index}`}>
                    <MantleLink
                      onClick={() =>
                        gtag('event', 'header_bridge_click', {
                          tab: item.name,
                          network: isTestnet ? 'testnet' : 'mainnet',
                        })
                      }
                      variant="navLink"
                      href={item.href}
                      target={item.internal ? '_self' : '_blank'}
                      rel="noreferrer noopener"
                      className={clsx(mobileNavCat)}
                    >
                      {item.name}
                    </MantleLink>
                    <div style={{ borderBottom: '1px solid #2E524E' }} />
                  </span>
                ))}
                <div className="nav-mobile-wallet w-full flex">
                  {walletConnect}
                </div>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  )
}
