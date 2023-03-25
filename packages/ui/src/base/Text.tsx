/* eslint-disable react/jsx-props-no-spreading */
// @ts-nocheck
import React, { FC, type ReactNode } from 'react'
import clsx from 'clsx'
import './typography.css'

interface Props {
  variant:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'subheading1'
    | 'subheading2'
    | 'body1'
    | 'body2'
  color: string
  children: ReactNode
  [x: string]: any
}

const variantsMapping: { [key: string]: string } = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  subheading1: 'h6',
  subheading2: 'h6',
  body1: 'p',
  body2: 'p',
}

export const Text: FC<Props> = ({ variant, color, children, ...props }) => {
  const Component = variant ? variantsMapping[variant] : 'p'

  return (
    <Component
      className={clsx({
        [`typography--variant-${variant}`]: variant,
        [`typography--color-${color}`]: color,
      })}
      {...props}
    >
      {children}
    </Component>
  )
}

export default Text
