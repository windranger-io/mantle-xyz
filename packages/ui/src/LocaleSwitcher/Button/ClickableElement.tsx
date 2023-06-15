/* eslint-disable react/require-default-props */
/* eslint-disable react/button-has-type */

import { Link as LocalizedLink } from 'next-intl'
import Link from 'next/link'
import { ReactNode } from 'react'
import classNames from 'classnames'

export type Anchor = 'a'
export type LinkElement = typeof LocalizedLink | typeof Link | Anchor

type ClickableElementProps = {
  href?: string
  prefetch?: boolean
  disabled?: boolean
  onClick?: () => void
  children: ReactNode
  className: string
  as?: LinkElement
  rel?: string
  target?: string
  full?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export const ClickableElement = ({
  href = undefined,
  prefetch,
  children,
  className,
  onClick,
  rel,
  as = Link,
  full,
  disabled,
  target,
  type = 'button',
}: ClickableElementProps) => {
  if (href) {
    const LinkElement = as

    return (
      <LinkElement
        href={href}
        target={target}
        className={classNames(className, 'flex', {
          'w-full h-full': full,
        })}
        prefetch={prefetch}
        rel={rel}
      >
        {children}
      </LinkElement>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      onKeyDown={onClick}
      className={classNames(className, {
        'w-full': full,
      })}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
