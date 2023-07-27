/* eslint-disable react/require-default-props */
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
  activeKey,
  isTestnet,
}: {
  walletConnect: React.ReactNode
  className?: string
  sticky?: boolean
  navLite?: boolean
  activeKey: string
  isTestnet: boolean
}) => (
  <header
    className={
      sticky
        ? cn('sticky top-0', ` ${className || ``}`)
        : cn('mb-12', ` ${className || ``}`)
    }
  >
    {navLite ? (
      <NavigationLite
        walletConnect={walletConnect}
        activeKey={activeKey}
        isTestnet={isTestnet}
      />
    ) : (
      <NavigationFull walletConnect={walletConnect} />
    )}

    {/* Wallet connect and language switcher - to be added per project */}
  </header>
)
