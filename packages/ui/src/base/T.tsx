/* eslint-disable react/require-default-props */
import classNames from 'classnames'
import { ReactNode } from 'react'
import Balancer from 'react-wrap-balancer'
import { twMerge } from 'tailwind-merge'

type TypographyVariant =
  | 'appPageHeading'
  | 'body'
  | 'bodyLongform'
  | 'smallWidget'
  | 'modalHeading'
  | 'transactionTableHeading'
  | 'footerColumnLabel'

type HTMLTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'

type TypographyComponentProps = {
  children: ReactNode
  /**
   * Create balanced title that will automatically find the best alignment possible and improve readability
   */
  withBalancer?: boolean
  /**
   * Variant to use
   */
  variant?: TypographyVariant
  className?: string
  style?: React.CSSProperties
}

const headingDefault = 'GTWalsheimMedium'
const bodyDefault = 'GTWalsheimRegular'

const typographyMap: {
  [key in TypographyVariant]: { tag: HTMLTag; classNames: string }
} = {
  appPageHeading: {
    tag: 'h1',
    classNames: classNames(headingDefault, 'text-[48px] text-type-primary'),
  },
  body: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'font-normal text-[14px] leading-[20px] text-type-secondary',
    ),
  },
  bodyLongform: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'font-normal text-[20px] leading-[28px] text-type-primary',
    ),
  },
  transactionTableHeading: {
    tag: 'h3',
    classNames: classNames(
      headingDefault,
      'text-[28px] leading-[33px] text-white',
    ),
  },
  modalHeading: {
    tag: 'h2',
    classNames: classNames(
      headingDefault,
      'text-[28px] leading-[33px] text-white',
    ),
  },
  smallWidget: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'font-normal text-[16px] leading-[22px] text-type-secondary',
    ),
  },
  footerColumnLabel: {
    tag: 'h6',
    classNames: classNames(
      bodyDefault,
      'text-[14px] leading-[20px] text-type-primary',
    ),
  },
}

export const Typography = ({
  children,
  withBalancer = false,
  variant = 'body',
  style,
  className,
}: TypographyComponentProps) => {
  const typography = typographyMap[variant]
  const Element = typography.tag

  const mergedClassnames = twMerge(typography.classNames, className)

  return (
    <Element style={style} className={classNames(mergedClassnames)}>
      {withBalancer ? <Balancer>{children}</Balancer> : children}
    </Element>
  )
}

export const T = Typography
