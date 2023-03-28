/* eslint-disable react/require-default-props */
import { type ButtonHTMLAttributes, type ReactNode } from 'react'

import { type Variant, type Size } from './types'

import { classes } from './styles'
import { cls } from './helper'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size
  variant?: Variant
  children: ReactNode
}

export const Button = ({
  size = 'regular',
  variant = 'primary',
  children,
  className,
  ...props
}: Props) => (
  // eslint-disable-next-line react/button-has-type
  <button
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
  </button>
)
