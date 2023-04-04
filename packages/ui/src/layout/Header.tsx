import * as React from 'react'
import clsx from 'clsx'
import { Navigation } from './Navigation'

export const Header = ({
  children,
  className,
}: {
  children: React.ReactNode
  // eslint-disable-next-line react/require-default-props
  className?: string
}) => (
  <div className={clsx('sticky top-0', ` ${className || ``}`)}>
    {/* Logo */}
    <Navigation>{children}</Navigation>
    {/* Wallet connect and language switcher - to be added per project */}
  </div>
)
