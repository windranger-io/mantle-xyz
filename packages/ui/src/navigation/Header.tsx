/* eslint-disable react/require-default-props */
import * as React from 'react'
import { cn } from '../utils'
import { NavItem, NavigationLite } from './NavigationLite'
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
  mobileMenuOpen,
  setMobileMenuOpen,
  navItems,
}: {
  walletConnect: React.ReactNode
  className?: string
  sticky?: boolean
  navLite?: boolean
  activeKey: string
  mobileMenuOpen: boolean
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
  navItems: NavItem[]
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
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navItems={navItems}
      />
    ) : (
      <NavigationFull
        walletConnect={walletConnect}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
    )}

    {/* Wallet connect and language switcher - to be added per project */}
  </header>
)
