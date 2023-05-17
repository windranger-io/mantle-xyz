import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'walletConnect'
type ButtonSize = 'regular' | 'large' | 'small' | 'full'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  // eslint-disable-next-line react/require-default-props
  size?: ButtonSize
  // eslint-disable-next-line react/require-default-props
  variant?: ButtonVariant
  children: ReactNode
  // eslint-disable-next-line react/require-default-props
  className?: string
}

export const Button = ({
  size = 'regular',
  variant = 'primary',
  children,
  className,
  ...props
}: Props) => {
  const classNameHasWidth = !!className?.match(/(^\\w|\s\\w)-/)
  const classNameHasHeight = !!className?.match(/(^h|\sh)-/)

  return (
    // eslint-disable-next-line react/button-has-type
    <button
      className={clsx(
        `${
          classNameHasHeight ? '' : 'h-fit '
        }rounded-lg text-xs font-medium transition-all`,
        'disabled:cursor-not-allowed disabled:opacity-50',
        size === 'large' &&
          `${classNameHasWidth ? '' : 'w-fit '} px-5 py-3 text-base`,
        size === 'regular' &&
          `${classNameHasWidth ? '' : 'w-fit '} px-4 py-2 text-sm`,
        size === 'small' && `${classNameHasWidth ? '' : 'w-fit '} px-2 py-2`,
        size === 'full' &&
          `${classNameHasWidth ? '' : 'w-full '}px-5 py-3 text-base`,
        variant === 'primary' &&
          'text-black bg-button-primary hover:bg-button-primaryHover disabled:hover:bg-button-disabled',
        variant === 'secondary' &&
          'text-black bg-button-secondary hover:bg-button-secondaryHover disabled:hover:bg-button-disabled',
        variant === 'outline' &&
          'border border-brand text-brand hover:border-brand-dark hover:bg-brand-light disabled:border-brand disabled:bg-transparent',
        variant === 'ghost' &&
          'text-brand hover:bg-brand-light disabled:hover:bg-transparent',
        variant === 'walletConnect' &&
          'text-black bg-button-primary hover:bg-button-primaryHover disabled:hover:bg-transparent text-sm',
        variant === 'link' &&
          'text-brand p-0 hover:underline disabled:no-underline',
        `${className}`,
      )}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      {children}
    </button>
  )
}
