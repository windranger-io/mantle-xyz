/* eslint-disable react/require-default-props */

import { LinkHTMLAttributes, type ReactNode } from 'react'
import Link from 'next/link'

import { type Variant, type Size } from './types'

import { classes } from './styles'
import { cls } from './helper'

interface LinkProps
  extends Omit<
    LinkHTMLAttributes<HTMLAnchorElement>,
    'dangerouslySetInnerHTML'
  > {
  size?: Size
  variant?: Variant
  href: string
  children: ReactNode
  target?: string
  shallow?: boolean
}

export const MantleLink = ({
  size = 'regular',
  variant = 'primary',
  shallow = false,
  href,
  children,
  className,
  target,
  ...props
}: LinkProps) => (
  // eslint-disable-next-line react/button-has-type
  <Link
    href={href}
    target={target}
    className={cls(`
    ${classes.base}
    ${classes.size[size]}
    ${classes.variant[variant]}
    ${className}
  `)}
    shallow={shallow}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  >
    {children}
  </Link>
)
