import { LinkHTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'

type LinkVariant =
  | 'regular'
  | 'outline'
  | 'ghost'
  | 'website'
  | 'faucetGoerli'
  | 'nav'
  | 'footer'
type LinkSize = 'regular' | 'large' | 'small'

interface Props extends LinkHTMLAttributes<HTMLAnchorElement> {
  href: string
  // eslint-disable-next-line react/require-default-props
  target?: any
  // eslint-disable-next-line react/require-default-props
  size?: LinkSize
  // eslint-disable-next-line react/require-default-props
  variant?: LinkVariant
  children: ReactNode
}

export const Links = ({
  href,
  target,
  size = 'regular',
  variant = 'regular',
  children,
  className,
  ...props
}: Props) => (
  // eslint-disable-next-line react/button-has-type
  <a
    href={href}
    target={target}
    className={
      (clsx(
        'text-type-secondary hover:text-type-primary text-sm transition ease-in-out duration-300 cursor-pointer',
        size === 'large' && '',
        size === 'regular' && '',
        size === 'small' && '',
        variant === 'regular' && '',
        variant === 'outline' && '',
        variant === 'ghost' && '',
        variant === 'website' && '',
        variant === 'faucetGoerli' &&
          'underline text-[#0A8FF6] hover:text-button-primary transition ease-in-out duration-300 cursor-pointer',
        variant === 'nav' && '',
        variant === 'footer' && '',
      ),
      `${className || ``}`)
    }
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  >
    {children}
  </a>
)
