import * as React from 'react'
import Link from 'next/link'

import CONST from '@mantle/constants'
import { MantleLogoIcon, MantleLogoText } from '../base/Icons'
import { Links } from '../actions/Links'

const COMMUNITY_ITEMS = [
  {
    name: 'footer-discord',
    href: CONST.SOCIAL_LINKS.DISCORD_LINK || '#',
    internal: false,
  },
  {
    name: 'footer-twitter',
    href: CONST.SOCIAL_LINKS.TWITTER_LINK || '#',
    internal: false,
  },
  {
    name: 'footer-medium',
    href: CONST.SOCIAL_LINKS.MEDIUM_LINK || '#',
    internal: false,
  },
  {
    name: 'footer-telegram',
    href: CONST.SOCIAL_LINKS.TELEGRAM_LINK || '#',
    internal: false,
  },
  {
    name: 'footer-roles',
    href: CONST.NAV_LINKS_ABSOLUTE.ROLES_LINK || '#',
    internal: true,
  },
]

const LEGAL_ITEMS = [
  {
    name: 'footer-privacy-policy',
    href: CONST.NAV_LINKS_ABSOLUTE.PRIVACY_LINK || '#',
    internal: true,
  },
  {
    name: 'footer-terms',
    href: CONST.NAV_LINKS_ABSOLUTE.TERMS_LINK || '#',
    internal: true,
  },
]

const RESOURCE_ITEMS = [
  {
    name: 'footer-docs',
    href: CONST.RESOURCE_LINKS.DOC_LINK || '#',
    internal: false,
  },
  {
    name: 'footer-github',
    href: CONST.RESOURCE_LINKS.GITHUB_LINK || '#',
    internal: false,
  },
  {
    name: 'footer-faucet',
    href: CONST.RESOURCE_LINKS.FAUCET_LINK || '#',
    internal: false,
  },
  {
    name: 'footer-bridge',
    href: CONST.RESOURCE_LINKS.BRIDGE_LINK || '#',
    internal: false,
  },
  {
    name: 'footer-explorer',
    href: CONST.RESOURCE_LINKS.EXPLORER_LINK || '#',
    internal: false,
  },
  {
    name: 'footer-brand',
    href: CONST.RESOURCE_LINKS.BRAND_LINK || '#',
    internal: false,
  },
]

const FOOTER_ITEMS = [
  {
    title: 'footer-community-heading',
    columnItems: COMMUNITY_ITEMS,
  },

  {
    title: 'footer-resources-heading',
    columnItems: RESOURCE_ITEMS,
  },
  {
    title: 'footer-legal-heading',
    columnItems: LEGAL_ITEMS,
  },
]

export const Footer = () => (
  <footer aria-labelledby="footerHeading">
    <div className="max-w-7xl mx-auto grid gap-10 ">
      <div className="flex flex-col md:flex-row gap-10 lg:gap-20">
        <Link href="/">
          <MantleLogoIcon width={37} height={37} />
        </Link>
        <div className="flex flex-wrap gap-10 md:gap-20">
          {FOOTER_ITEMS.map(item => (
            <div key={item.title}>
              <h6 className="text-type-primary text-sm  mb-4 md:mb-6">
                {item.title}
              </h6>
              <ul className="grid gap-1">
                {item.columnItems.map(columnItem => (
                  <li key={columnItem.name}>
                    <Links
                      variant="footer"
                      href={`${columnItem.href}`}
                      rel="noreferrer noopener"
                      target={columnItem.internal ? '_self' : '_blank'}
                    >
                      {columnItem.name}
                    </Links>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <MantleLogoText />
    </div>
  </footer>
)
