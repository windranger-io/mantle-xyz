'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import CONST from '@mantle/constants'
import clsx from 'clsx'
import { MantleLogoIcon, MantleLockUp } from '../base/Icons'
import { Links } from '../actions/Links'

import { mobileNavCat, mobileNavCatText } from './styles'

export const NavigationLite = ({
  walletConnect,
}: {
  walletConnect: React.ReactNode
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="relative">
      <nav
        className="mx-auto  max-w-7xl  p-4 lg:px-8 items-center grid grid-cols-2 lg:grid-cols-3"
        aria-label="Global"
      >
        <div className="flex">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Mantle</span>

            {/* flex lg:hidden" */}
            <MantleLockUp className="h-8 w-auto " />
          </Link>
        </div>

        <div className="hidden lg:flex justify-between">
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
            <div className="rounded-full bg-white h-1 w-1  absolute left-[50%] bottom-[-10px]" />
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

        <div className="flex justify-end gap-10">
          <div className="grid">{walletConnect}</div>
          <div className="grid lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon
                className="h-8 w-8 ext-type-secondary hover:text-type-primary transition ease-in-out duration-300"
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
              <div className="space-y-4 py-6 pl-4">
                <Link
                  href={CONST.RESOURCE_LINKS.BRIDGE_LINK}
                  rel="noreferrer noopener"
                  target="_blank"
                  className={clsx(mobileNavCat, mobileNavCatText)}
                >
                  Bridge
                </Link>
                <div style={{ borderBottom: '1px solid #2E524E' }} />
                <Link
                  href="/"
                  rel="noreferrer noopener"
                  target="_blank"
                  className={clsx(mobileNavCat, mobileNavCatText)}
                >
                  Faucet
                </Link>
                <div style={{ borderBottom: '1px solid #2E524E' }} />
                <Link
                  href={CONST.NAV_LINKS_ABSOLUTE.ECOSYSTEM_LINK}
                  className={clsx(mobileNavCat, mobileNavCatText)}
                >
                  Docs
                </Link>
                <div style={{ borderBottom: '1px solid #2E524E' }} />
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  )
}

// import Link from 'next/link'

// import CONST from '@mantle/constants'
// import { MantleLockUp } from '../base/Icons'
// import { Links } from '../actions/Links'

// export const NavigationLite = ({
//   walletConnect,
// }: {
//   walletConnect: React.ReactNode
// }) => {
//   return (
//     <header className="relative  ">
//       <nav
//         className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8"
//         aria-label="Global"
//       >
//         <div className="flex lg:flex-1">
//           <Link href="/" className="-m-1.5 p-1.5">
//             <span className="sr-only">Mantle</span>

//             <MantleLockUp className="h-8 w-auto " />
//           </Link>
//         </div>
//         <div className="flex gap-10">
//           <Links
//             href={CONST.RESOURCE_LINKS.BRIDGE_LINK}
//             rel="noreferrer noopener"
//             target="_blank"
//             className="text-type-secondary hover:text-type-primary  transition ease-in-out duration-300 cursor-pointer"
//           >
//             Bridge
//           </Links>

//           <Links href="/" className="text-type-primary cursor-pointer relative">
//             Faucet
//             <div className="rounded-full bg-white h-1 w-1  absolute left-[50%]" />
//           </Links>
//           <Links
//             href={CONST.RESOURCE_LINKS.DOC_LINK}
//             rel="noreferrer noopener"
//             target="_blank"
//             className="text-type-secondary hover:text-type-primary  transition ease-in-out duration-300 cursor-pointer"
//           >
//             Docs
//           </Links>
//         </div>
//         <div className=" flex flex-1 justify-end">{walletConnect}</div>
//       </nav>
//     </header>
//   )
// }
