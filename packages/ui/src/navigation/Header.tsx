import * as React from 'react'
import { cn } from '../utils'
import { NavigationLite } from './NavigationLite'
import { NavigationFull } from './NavigationFull'

/**
 * Sticky for sticky header
 * Navlite for nav without interior pages e.g. faucet or bridge
 */

export const Header = ({
  className,
  walletConnect,
  sticky,
  navLite = false,
  navItems,
}: {
  // eslint-disable-next-line react/require-default-props
  walletConnect: React.ReactNode
  // eslint-disable-next-line react/require-default-props
  className?: string
  // eslint-disable-next-line react/require-default-props
  sticky?: boolean
  // eslint-disable-next-line react/require-default-props
  navLite?: boolean
  // eslint-disable-next-line react/require-default-props
  navItems?: any
}) => (
  <header
    className={
      sticky
        ? cn('sticky top-0', ` ${className || ``}`)
        : cn('mb-20', ` ${className || ``}`)
    }
  >
    {navLite ? (
      <NavigationLite walletConnect={walletConnect} navItems={navItems} />
    ) : (
      <NavigationFull walletConnect={walletConnect} />
    )}

    {/* Wallet connect and language switcher - to be added per project */}
  </header>
)
