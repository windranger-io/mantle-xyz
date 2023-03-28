/* eslint-disable react/require-default-props */
import classNames from 'classnames'
import { ReactNode } from 'react'
import Balancer from 'react-wrap-balancer'
import { twMerge } from 'tailwind-merge'

type TypographyVariant =
  | 'header'
  | 'headerHero'
  | 'headerSmall'
  | 'subHeader'
  | 'pageInfo'
  | 'sectionHeader'
  | 'body'
  | 'bodyLarge'
  | 'bodySmall'
  | 'button'
  | 'tag'
  | 'callout'
  | 'cardHeader'
  | 'cardBody'
  | 'cardBodySmall'
  | 'cardCaption'
  | 'cardAnnouncement'
  | 'code'
  | 'captionSmall'
  | 'sofiya'

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

const headingDefault = 'text-ds-text-primary'
const bodyDefault = 'text-ds-text-secondary'

const typographyMap: {
  [key in TypographyVariant]: { tag: HTMLTag; classNames: string }
} = {
  header: {
    tag: 'h1',
    classNames: classNames(
      headingDefault,
      'font-semibold text-[64px] leading-normal',
    ),
  },
  headerHero: {
    tag: 'h1',
    classNames: classNames(headingDefault, 'text-7xl font-medium '),
  },
  headerSmall: {
    tag: 'h1',
    classNames: classNames(
      headingDefault,
      'font-semibold text-[42px] leading-normal',
    ),
  },
  subHeader: {
    tag: 'h2',
    classNames: classNames(
      headingDefault,
      'font-normal text-[32px] leading-[42px]',
    ),
  },
  pageInfo: {
    tag: 'h3',
    classNames: classNames(
      headingDefault,
      'font-medium text-[20px] leading-[36px]',
    ),
  },
  sectionHeader: {
    tag: 'h3',
    classNames: classNames(
      headingDefault,
      'font-normal text-[20px] leading-[36px]',
    ),
  },
  bodyLarge: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'font-normal text-[16px] leading-[24px]',
    ),
  },
  bodySmall: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'font-normal text-[13px] leading-[20px]',
    ),
  },
  body: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'font-normal text-[15px] leading-[27px]',
    ),
  },
  button: {
    tag: 'p',
    classNames: classNames('font-normal text-[15px] leading-normal'),
  },
  tag: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'font-normal text-[15px] leading-normal',
    ),
  },
  callout: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'font-normal text-[14px] leading-[24px]',
    ),
  },
  cardHeader: {
    tag: 'h6',
    classNames: classNames(
      headingDefault,
      'font-medium text-[18px] leading-[24px]',
    ),
  },
  cardBody: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'font-normal text-[14px] leading-[20px]',
    ),
  },
  captionSmall: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'font-normal text-[10px] leading-normal',
    ),
  },
  cardCaption: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'font-normal text-[13px] leading-[20px]',
    ),
  },
  cardAnnouncement: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'font-normal text-[13px] leading-[18px]',
    ),
  },
  cardBodySmall: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'font-normal text-[12px] leading-[18px]',
    ),
  },
  code: {
    tag: 'p',
    classNames: classNames(
      bodyDefault,
      'font-mono font-normal text-[16px] leading-normal',
    ),
  },
  sofiya: {
    tag: 'h1',
    classNames: classNames(bodyDefault, 'text-status-error'),
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
