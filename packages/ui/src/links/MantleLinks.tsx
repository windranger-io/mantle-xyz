/* eslint-disable react/require-default-props */

import { LinkHTMLAttributes, type ReactNode } from 'react'

import { type Variant, type Size } from './types'

import { classes } from './styles'
import { cls } from './helper'

interface LinkProps extends LinkHTMLAttributes<HTMLAnchorElement> {
  size?: Size
  variant?: Variant
  href: string
  children: ReactNode
  target: string
}

export const MantleLink = ({
  size = 'regular',
  variant = 'primary',
  href,
  children,
  className,
  target,
  ...props
}: LinkProps) => (
  // eslint-disable-next-line react/button-has-type
  <a
    href={href}
    className={cls(`
    ${classes.base}
    ${classes.size[size]}
    ${classes.variant[variant]}
    ${className}
  `)}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  >
    {children}
  </a>
)
