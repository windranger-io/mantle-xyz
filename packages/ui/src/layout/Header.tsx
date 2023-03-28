import * as React from 'react'
import { Navigation } from './Navigation'

export const Header = ({
  children,
  className,
}: {
  children: React.ReactNode
  // eslint-disable-next-line react/require-default-props
  className?: string
}) => (
  <header className={` ${className || ``}`}>
    {/* Logo */}
    <Navigation />
    {/* Wallet connect and language switcher - to be added per project */}
    {children}
  </header>
)
