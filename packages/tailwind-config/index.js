const colors = require('tailwindcss/colors')
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
    },
  },
  plugins: [],
}
