import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'

type ButtonVariant = 'regular' | 'outline' | 'ghost' | 'link' | 'walletConnect'
type ButtonSize = 'regular' | 'large' | 'small'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  // eslint-disable-next-line react/require-default-props
  size?: ButtonSize
  // eslint-disable-next-line react/require-default-props
  variant?: ButtonVariant
  children: ReactNode
}

export const Button = ({
  size = 'regular',
  variant = 'regular',
  children,
  className,
  ...props
}: Props) => (
  // eslint-disable-next-line react/button-has-type
  <button
    className={clsx(
      'h-fit w-fit rounded-lg text-xs font-medium transition-all',
      'disabled:cursor-not-allowed disabled:opacity-50',
      size === 'large' && 'px-5 py-3 text-base',
      size === 'regular' && 'px-4 py-2 text-sm',
      size === 'small' && 'px-2 py-2',
      variant === 'regular' &&
        'bg-brand text-white hover:bg-brand-dark disabled:hover:bg-brand',
      variant === 'outline' &&
        'border border-brand text-brand hover:border-brand-dark hover:bg-brand-light disabled:border-brand disabled:bg-transparent',
      variant === 'ghost' &&
        'text-brand hover:bg-brand-light disabled:hover:bg-transparent',
      variant === 'walletConnect' &&
        'text-black bg-button-primary hover:bg-button-primaryHover disabled:hover:bg-transparent',
      variant === 'link' && 'text-brand hover:underline disabled:no-underline',
    )}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  >
    {children}
  </button>
)
