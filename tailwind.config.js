/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.tsx',
    './src/components/**/*.tsx',
    './src/features/**/*.tsx',
  ],
  theme: {
    extend: {
      colors: {
        main: '#FDFEFE',
        light: '#8eacbb',
        ai: '#a782c3',
      },
      fontSize: {
        '2xs': '0.5rem',
      },
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
}
