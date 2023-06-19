import classNames from 'classnames'
import { ReactNode } from 'react'

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>
}

export type ComponentSize = 'small' | 'normal' | 'large'

export type SharedDesignSystemProps = {
  /**
   * classNames utility available thro this props, those will be merged with other classNames
   * (priority to those ones)
   */
  cn?: classNames.ArgumentArray
}

export type ColorChildren = { [key: string]: string | ColorChildren }

export type DefaultColorKeys = {
  bg: {
    container: string
    card: string
    cardOverlay: string
    body: string
  }
  text: {
    primary: string
    secondary: string
    muted: string
    invert: string
    chartreuseMuted: string
    error: string
  }
  stroke: {
    primary: string
    secondary: string
  }
  callout: {
    warnFill: string
    warn: string
    successFill: string
    success: string
  }
  btn: {
    navPrimary: string
    navActive: string
    primary: string
    active: string
    chartreuse: string
    error: string
  }
  tag: {
    gray: string
    red: string
    yellow: string
  }
  icon: {
    primary: string
    secondary: string
    invert: string
    muted: string
    error: string
  }
  gradient: {
    primary: string
  }
}

export type SharedColors = {
  chartreuse: string
  white: string
  black: string
  purple: string
  grayDark: string
  gray: string
  grayLight: string
  grayOpacity: string
  skyBlueOpacity: string
  greenDark: string
  greenLight: string
  red: string
}

export type Config = {
  colors?: {
    light: DeepPartial<DefaultColorKeys> & SharedColors
    dark: DeepPartial<DefaultColorKeys> & SharedColors
  }
}

export type MenuSubItems = { [key: string]: MenuSubItems | string }

export type MenuItems = {
  [key: string]: { subItems: MenuSubItems | string; icon?: ReactNode }
}
