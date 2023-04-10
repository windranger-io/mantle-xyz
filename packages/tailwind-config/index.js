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
        'sans': ['var(--font-GTWalsheimRegular)', ...fontFamily.sans],
      },
      zIndex: {
        'faucetBg': '-1'
      },
      borderRadius: {
        'card': '14px',
        'input': '10px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
