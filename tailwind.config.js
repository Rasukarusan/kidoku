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
        main: '#263238',
        light: '#8eacbb',
      },
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
}
