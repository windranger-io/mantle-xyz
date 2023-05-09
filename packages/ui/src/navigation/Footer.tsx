import * as React from 'react'
import Link from 'next/link'

import CONST from '@mantle/constants'
import { MantleLetterMark, MantleLockUpByline } from '../base/Icons'
import { Typography } from '../base/T'
import { MantleLink } from '../links/MantleLinks'

const COMMUNITY_ITEMS = [
  {
    name: 'Discord',
    href: CONST.SOCIAL_LINKS.DISCORD_LINK || '#',
    internal: false,
  },
  {
    name: 'Twitter',
    href: CONST.SOCIAL_LINKS.TWITTER_LINK || '#',
    internal: false,
  },
  {
    name: 'Medium',
    href: CONST.SOCIAL_LINKS.MEDIUM_LINK || '#',
    internal: false,
  },
  {
    name: 'Telegram',
    href: CONST.SOCIAL_LINKS.TELEGRAM_LINK || '#',
    internal: false,
  },
  {
    name: 'Careers',
    href: CONST.NAV_LINKS_ABSOLUTE.ROLES_LINK || '#',
    internal: false,
  },
]

const LEGAL_ITEMS = [
  {
    name: 'Privacy Policy',
    href: CONST.NAV_LINKS_ABSOLUTE.PRIVACY_LINK || '#',
    internal: false,
  },
  {
    name: 'Terms',
    href: CONST.NAV_LINKS_ABSOLUTE.TERMS_LINK || '#',
    internal: false,
  },
]

const RESOURCE_ITEMS = [
  {
    name: 'Docs',
    href: CONST.RESOURCE_LINKS.DOC_LINK || '#',
    internal: false,
  },
  {
    name: 'Github',
    href: CONST.RESOURCE_LINKS.GITHUB_LINK || '#',
    internal: false,
  },
  // {
  //   name: 'footer-faucet',
  //   href: CONST.RESOURCE_LINKS.FAUCET_LINK || '#',
  //   internal: false,
  // },
  {
    name: 'Bridge',
    href: CONST.RESOURCE_LINKS.BRIDGE_LINK || '#',
    internal: false,
  },
  {
    name: 'Explorer',
    href: CONST.RESOURCE_LINKS.EXPLORER_LINK || '#',
    internal: false,
  },
  {
    name: 'Brand',
    href: CONST.RESOURCE_LINKS.BRAND_LINK || '#',
    internal: false,
  },
]

const FOOTER_ITEMS = [
  {
    title: 'Community',
    columnItems: COMMUNITY_ITEMS,
  },

  {
    title: 'Resources',
    columnItems: RESOURCE_ITEMS,
  },
  {
    title: 'Legal',
    columnItems: LEGAL_ITEMS,
  },
]

export const Footer = () => (
  <footer
    aria-labelledby="footerHeading "
    // remove uppercase when translations happen
    className="max-w-7xl mx-auto px-4 py-6 lg:py-12 lg:px-8 uppercase"
  >
    <div className="grid grid-cols-1 gap-10 lg:gap-0 md:grid-cols-4 mb-8">
      <div className="flex flex-col gap-4">
        <Link href={CONST.WEBSITE} rel="noreferrer noopener" target="_blank">
          <MantleLockUpByline />
        </Link>
        <p className="text-xs">{new Date().getFullYear()}&nbsp;&#169;</p>
      </div>

      {FOOTER_ITEMS.map(item => (
        <div key={item.title}>
          {/* Approximation of baseline alignment for logo and columns */}
          <Typography variant="footerColumnLabel" className="mt-2 mb-4 md:mb-6">
            {item.title}
          </Typography>
          <ul className="grid gap-1">
            {item.columnItems.map(columnItem => (
              <li key={columnItem.name}>
                <MantleLink
                  href={`${columnItem.href}`}
                  variant="footer"
                  rel="noreferrer noopener"
                  target={columnItem.internal ? '_self' : '_blank'}
                >
                  {columnItem.name}
                </MantleLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <MantleLetterMark />
  </footer>
)
