/* eslint-disable react/require-default-props */

import classNames from 'classnames'
import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { SharedDesignSystemProps } from './types'
import { IconLoading, IconProps } from './Icons'
import { ClickableElement, LinkElement } from './ClickableElement'
import { T as Text } from './T'

export type ButtonVariant =
  | 'standard'
  | 'chartreuse'
  | 'stroke'
  | 'navbar'
  | 'bare'

export type ButtonSize = 'small' | 'normal' | 'free'
export type IconComponent = (props: IconProps) => JSX.Element

type ButtonProps = SharedDesignSystemProps & {
  children?: ReactNode
  /**
   * Display loading state
   */
  className?: string
  loading?: boolean
  /**
   * Size of the button
   */
  size?: ButtonSize
  variant?: ButtonVariant
  /**
   * Display an error state
   */
  error?: boolean
  /**
   * Disable the button
   */
  disabled?: boolean
  /**
   * Icon to be display on the right end side of the button
   */
  prefetch?: boolean
  icon?: IconComponent
  onClick?: () => void
} & (
    | {
        /**
         * Use anchor tag
         */
        href?: string
        /**
         * Component to be used as anchor tag, default to next-intl's Link
         */
        as?: LinkElement
        target?: string
        type?: never
      }
    | {
        /**
         * Variant of the button
         */
        type?: 'button' | 'submit' | 'reset'
        href?: never
        as?: never
        target?: never
      }
  )

const sizeClassnamesMap: { [key in ButtonSize]: string } = {
  free: '',
  small: 'px-[14px] py-[6px] text-[13px]',
  normal: 'px-[14px] py-2 text-[15px]',
}

const variantClassnamesMap: { [key in ButtonVariant]: string } = {
  standard:
    'border-transparent text-ds-text-primary bg-ds-bg-card-overlay hover:bg-ds-btn-active active:bg-ds-btn-active',
  chartreuse:
    'border-transparent text-ds-black bg-ds-btn-chartreuse hover:bg-ds-green-light active:bg-ds-green-light',
  stroke: 'border-ds-stroke-secondary text-ds-text-primary hover:bg-ds-bg-card',
  bare: 'border-transparent text-ds-text-primary hover:bg-ds-bg-card',
  navbar: 'border-transparent',
}

const iconClassnamesMap: { [key in ButtonSize]: string } = {
  free: '',
  small: 'h-[13px] w-[13px]',
  normal: 'h-[15px] w-[15px]',
}

// export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
export const Button = ({
  children,
  className,
  size = 'normal',
  variant = 'standard',
  loading = undefined,
  as,
  disabled = false,
  error = false,
  prefetch,
  href,
  target,
  type,
  icon: Icon,
  onClick,
}: ButtonProps) => {
  const defaultClassnames =
    'capitalize bg-btn-primary inline-block w-fit items-center justify-center rounded-lg border focus:outline-none hover:cursor-pointer grid grid-flow-col auto-cols-max gap-2.5'
  const sizeClassnames = sizeClassnamesMap[size]
  const variantClassnames = variantClassnamesMap[variant]
  const disabledClassnames =
    'text-ds-text-muted pointer-events-none hover:cursor-not-allowed'
  const errorClassnames = ''
  const iconClassnames = iconClassnamesMap[size]

  const mergedClassnames = twMerge(
    defaultClassnames,
    sizeClassnames,
    variantClassnames,
    className,
  )

  return (
    <ClickableElement
      type={type}
      href={href}
      target={target}
      prefetch={prefetch}
      className={classNames(
        mergedClassnames,
        variantClassnames,
        defaultClassnames,
        sizeClassnames,
        disabled && disabledClassnames,
        error && errorClassnames,
      )}
      onClick={onClick}
      as={as}
    >
      {loading ? (
        <>
          <IconLoading className={iconClassnames} /> loading
        </>
      ) : (
        <>
          {Icon && <Icon className={iconClassnames} />}
          {typeof children === 'string' ? (
            <Text variant="button">{children}</Text>
          ) : (
            children
          )}
        </>
      )}
    </ClickableElement>
  )
}
