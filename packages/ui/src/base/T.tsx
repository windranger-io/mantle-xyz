/* eslint-disable react/require-default-props */
import classNames from 'classnames'
import { ReactNode } from 'react'
import Balancer from 'react-wrap-balancer'
import { twMerge } from 'tailwind-merge'

// TODO: font regular and medium don't seem correct

type TypographyVariant =
  | 'appPageHeading'
  | 'body'
  | 'bodyLongform'
  | 'legalDisclaimer'
  | 'smallWidget'
  | 'modalHeading'
  | 'transactionTableHeading'
  | 'modalHeadingSm'
  | 'footerColumnLabel'
  // the variants below are typographies in mantle core style guide
  | 'h1HeaderXXL'
  | 'h2HeaderXL'
  | 'h3Subheader'
  | 'h4PageInfo'
  | 'h5Title'
  | 'h6TitleSmaller'
  | 'h6TitleMini'
  | 'body24'
  | 'body22'
  | 'body20'
  | 'body20Medium'
  | 'body18'
  | 'smallTitle18'
  | 'buttonLarge'
  | 'smallWidget16'
  | 'microBody14'
  | 'buttonMedium'
  | 'footerLink'
  | 'textBtn12'

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
  legalDisclaimer: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'font-normal text-[14px] leading-[20px] text-type-secondary',
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
  modalHeadingSm: {
    tag: 'h2',
    classNames: classNames(
      headingDefault,
      'text-[24px] leading-[33px] text-white',
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
  // the variants below are typographies in mantle core style guide
  h1HeaderXXL: {
    tag: 'h1',
    classNames: classNames(
      headingDefault,
      'text-[100px] leading-none tracking-[-0.04em] text-type-primary font-medium text-left',
    ),
  },
  h2HeaderXL: {
    tag: 'h2',
    classNames: classNames(
      headingDefault,
      'text-[80px] leading-none tracking-[-0.04em] text-type-primary font-medium text-left',
    ),
  },
  h3Subheader: {
    tag: 'h3',
    classNames: classNames(
      headingDefault,
      'text-[68px] leading-[1.1] tracking-[-0.04em] text-type-primary font-medium text-left',
    ),
  },
  h4PageInfo: {
    tag: 'h4',
    classNames: classNames(
      headingDefault,
      'text-[60px] leading-[1.1] tracking-[-0.04em] text-type-primary font-medium text-left',
    ),
  },
  h5Title: {
    tag: 'h5',
    classNames: classNames(
      headingDefault,
      'text-[42px] leading-[1.1] tracking-[-0.04em] text-type-primary font-medium text-left',
    ),
  },
  h6TitleSmaller: {
    tag: 'h6',
    classNames: classNames(
      headingDefault,
      'text-[32px] leading-[1.2] tracking-[-0.04em] text-type-primary font-medium text-left',
    ),
  },
  h6TitleMini: {
    tag: 'h6',
    classNames: classNames(
      headingDefault,
      'text-[28px] leading-[1.2] tracking-[-0.04em] text-type-primary font-medium text-left',
    ),
  },
  body24: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'text-[24px] leading-[1.4] tracking-[-0.02em] text-type-secondary text-left',
    ),
  },
  body22: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'text-[22px] leading-[1.4] text-type-secondary text-left',
    ),
  },
  body20: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'text-[20px] leading-[1.4] text-type-secondary text-left',
    ),
  },
  body20Medium: {
    tag: 'p',
    classNames: classNames(
      headingDefault,
      'text-[20px] leading-[1.4] text-type-secondary font-medium text-left',
    ),
  },
  body18: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'text-[18px] leading-[1.4] text-type-secondary text-left',
    ),
  },
  smallTitle18: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'text-[18px] leading-[20px] tracking-[-0.02em] text-type-primary text-left',
    ),
  },
  buttonLarge: {
    tag: 'p',
    classNames: classNames(
      headingDefault,
      'text-[16px] leading-[1.4] text-type-secondary font-medium text-left',
    ),
  },
  smallWidget16: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'text-[16px] leading-[1.4] text-type-secondary text-left',
    ),
  },
  microBody14: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'text-[14px] leading-[20px] tracking-[-0.02em] text-type-secondary text-left',
    ),
  },
  buttonMedium: {
    tag: 'p',
    classNames: classNames(
      headingDefault,
      'text-[14px] leading-[1.3] text-type-secondary font-medium text-left',
    ),
  },
  footerLink: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'text-[14px] leading-[25px] tracking-[-0.01em] uppercase text-type-primary text-left',
    ),
  },
  textBtn12: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'text-[12px] leading-[20px] tracking-[-0.02em] text-type-secondary text-left',
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
