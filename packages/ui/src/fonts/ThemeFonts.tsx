import { type ReactNode } from 'react'

import localFont from '@next/font/local'

/**
 * TODO
 * add additional font weight if not variable font
 */

const GTWalsheimRegular = localFont({
  src: './GT-Walsheim-Regular.woff2',
  variable: '--font-GTWalsheimRegular',
})

interface Props {
  children: ReactNode
}

export const ThemeFonts = ({ children }: Props) => (
  <main className={`${GTWalsheimRegular.variable} font-sans`}>{children}</main>
)
