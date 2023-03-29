import { type ReactNode } from 'react'

import localFont from '@next/font/local'

const GTWalsheimRegular = localFont({
  src: './GT-Walsheim-Regular.woff2',
  variable: '--font-GTWalsheimRegular',
})

const GTWalsheimMedium = localFont({
  src: './GT-Walsheim-Medium.woff2',
  variable: '--font-GTWalsheim-Medium',
})

interface Props {
  children: ReactNode
}

export const ThemeFonts = ({ children }: Props) => (
  <main
    className={`${GTWalsheimRegular.variable} ${GTWalsheimMedium.variable} font-sans`}
  >
    {children}
  </main>
)
