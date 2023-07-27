const { fontFamily } = require('tailwindcss/defaultTheme')
const mantleColors = require('./colors')

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@mantle/ui/**/*.tsx',
  ],
  theme: {
    extend: {
      colors: mantleColors,
      fontFamily: {
        sans: ['var(--font-GTWalsheimRegular)', ...fontFamily.sans],
        sansSemiBold: ['var(--font-GTWalsheim-Medium)', ...fontFamily.sans],
      },
      zIndex: {
        pageBackgroundImage: '-100',
      },
      borderRadius: {
        card: '14px',
        input: '10px',
      },
      keyframes: {
        overlayShow: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        contentShow: {
          from: { opacity: 0, transform: 'translate(-50%, -48%) scale(0.96)' },
          to: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
        },
      },
      animation: {
        overlayShow: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        contentShow: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
