'use client'

import Link from 'next/link'
import { Fragment, useState } from 'react'
import { Dialog, Disclosure, Popover, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

import CONST from '@mantle/constants'
import clsx from 'clsx'
import { MantleLogoIcon, MantleLockUp } from '../base/Icons'

const RESOURCE_ITEMS = [
  {
    name: 'nav-docs',
    href: CONST.RESOURCE_LINKS.DOC_LINK || '#',
    internal: false,
  },
  {
    name: 'nav-github',
    href: CONST.RESOURCE_LINKS.GITHUB_LINK || '#',
    internal: false,
  },
  {
    name: 'nav-faucet',
    href: CONST.RESOURCE_LINKS.FAUCET_LINK || '#',
    internal: false,
  },
  {
    name: 'nav-bridge',
    href: CONST.RESOURCE_LINKS.BRIDGE_LINK || '#',
    internal: false,
  },

  {
    name: 'nav-explorer',
    href: CONST.RESOURCE_LINKS.EXPLORER_LINK || '#',
    internal: false,
  },
]

const COMMUNITY_ITEMS = [
  {
    name: 'nav-discord',
    href: CONST.SOCIAL_LINKS.DISCORD_LINK || '#',
    internal: false,
  },
  {
    name: 'nav-twitter',
    href: CONST.SOCIAL_LINKS.TWITTER_LINK || '#',
    internal: false,
  },

  {
    name: 'nav-medium',
    href: CONST.SOCIAL_LINKS.MEDIUM_LINK || '#',
    internal: false,
  },
  {
    name: 'nav-telegram',
    href: CONST.SOCIAL_LINKS.TELEGRAM_LINK || '#',
    internal: false,
  },
  {
    name: 'nav-roles',
    href: CONST.NAV_LINKS_ABSOLUTE.ROLES_LINK || '#',
    internal: false,
  },
  {
    name: 'Grants Program',
    href: CONST.NAV_LINKS_ABSOLUTE.ROLES_LINK,
    internal: false,
  },
]

export const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-black">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Mantle</span>

            <MantleLockUp className="h-8 w-auto " />
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <Popover.Group className="hidden lg:flex lg:gap-x-12">
          <Link
            href={CONST.NAV_LINKS_ABSOLUTE.DEV_LINK}
            className="text-sm font-semibold leading-6 text-white"
          >
            {/* <span>{t('nav-developers')}</span> */}
            <span>nav-developers</span>
          </Link>
          <Link
            href={CONST.NAV_LINKS_ABSOLUTE.ECOSYSTEM_LINK}
            className="text-sm font-semibold leading-6 text-white"
          >
            {/* <span>{t('nav-ecosystem')}</span> */}
            <span>nav-ecosystem</span>
          </Link>
          <Popover className="relative">
            <Popover.Button className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-white">
              {/* <span>{t('nav-resources')}</span> */}
              <span>nav-resources</span>
              <ChevronDownIcon
                className="h-5 w-5 flex-none text-gray-400"
                aria-hidden="true"
              />
            </Popover.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5">
                <div className="p-4">
                  {RESOURCE_ITEMS.map(item => (
                    <div
                      key={item.name}
                      className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50"
                    >
                      <div className="flex-auto">
                        <a
                          href={item.href}
                          className="block font-semibold text-white"
                          rel="noreferrer noopener"
                          target={item.internal ? '_self' : '_blank'}
                        >
                          {item.name}
                          <span className="absolute inset-0" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </Popover.Panel>
            </Transition>
          </Popover>
          <Popover className="relative">
            <Popover.Button className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-white">
              {/* <span>{t('nav-community')}</span> */}
              <span>nav-community</span>
              <ChevronDownIcon
                className="h-5 w-5 flex-none text-gray-400"
                aria-hidden="true"
              />
            </Popover.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5">
                <div className="p-4">
                  {COMMUNITY_ITEMS.map(item => (
                    <div
                      key={item.name}
                      className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50"
                    >
                      <div className="flex-auto">
                        <a
                          href={item.href}
                          className="block font-semibold text-white"
                          rel="noreferrer noopener"
                          target={item.internal ? '_self' : '_blank'}
                        >
                          {item.name}
                          <span className="absolute inset-0" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </Popover.Panel>
            </Transition>
          </Popover>
        </Popover.Group>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {/* <a href="#" className="text-sm font-semibold leading-6 text-white">
            Log in <span aria-hidden="true">&rarr;</span>
          </a> */}
        </div>
      </nav>
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-black px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
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
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                <Link
                  href={CONST.NAV_LINKS_ABSOLUTE.DEV_LINK}
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-gray-50"
                >
                  {/* <span>{t('nav-developers')}</span> */}
                  <span>nav-developers</span>
                </Link>
                <Link
                  href={CONST.NAV_LINKS_ABSOLUTE.ECOSYSTEM_LINK}
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-gray-50"
                >
                  {/* <span>{t('nav-ecosystem')}</span> */}
                  <span>nav-ecosystem</span>
                </Link>
                <Disclosure as="div" className="-mx-3">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 hover:bg-gray-50">
                        {/* <span>{t('nav-resources')}</span> */}
                        <span>nav-resources</span>
                        <ChevronDownIcon
                          className={clsx(
                            open ? 'rotate-180' : '',
                            'h-5 w-5 flex-none',
                          )}
                          aria-hidden="true"
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="mt-2 space-y-2">
                        {[...RESOURCE_ITEMS].map(item => (
                          <Disclosure.Button
                            key={item.name}
                            as="a"
                            href={item.href}
                            className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-white hover:bg-gray-50"
                          >
                            {item.name}
                          </Disclosure.Button>
                        ))}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
                <Disclosure as="div" className="-mx-3">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 hover:bg-gray-50">
                        {/* <span>{t('nav-community')}</span> */}
                        <span>nav-community</span>
                        <ChevronDownIcon
                          className={clsx(
                            open ? 'rotate-180' : '',
                            'h-5 w-5 flex-none',
                          )}
                          aria-hidden="true"
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="mt-2 space-y-2">
                        {[...COMMUNITY_ITEMS].map(item => (
                          <Disclosure.Button
                            key={item.name}
                            as="a"
                            href={item.href}
                            className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-white hover:bg-gray-50"
                          >
                            {item.name}
                          </Disclosure.Button>
                        ))}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  )
}
