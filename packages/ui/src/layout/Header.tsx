import * as React from 'react'
import clsx from 'clsx'
import { NavigationLite } from './NavigationLite'

export const Header = ({
  className,
  walletConnect,
}: {
  // eslint-disable-next-line react/require-default-props
  walletConnect: React.ReactNode
  // eslint-disable-next-line react/require-default-props
  className?: string
}) => (
  // <div className={clsx('sticky top-0', ` ${className || ``}`)}>
  <div className={clsx('mb-20', ` ${className || ``}`)}>
    {/* Logo */}
    <NavigationLite walletConnect={walletConnect} />
    {/* Wallet connect and language switcher - to be added per project */}
  </div>
)
