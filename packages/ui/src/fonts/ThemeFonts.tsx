import localFont from '@next/font/local'

const GTWalsheimRegular = localFont({
  src: './GT-Walsheim-Regular.woff2',
  variable: '--font-GTWalsheimRegular',
})

const GTWalsheimMedium = localFont({
  src: './GT-Walsheim-Medium.woff2',
  variable: '--font-GTWalsheim-Medium',
})

const GTWalsheim = localFont({
  src: [
    {
      path: './GT-Walsheim-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './GT-Walsheim-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-GTWalsheim',
})

export { GTWalsheimRegular, GTWalsheimMedium, GTWalsheim }
