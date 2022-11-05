/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.tsx',
    './src/components/**/*.tsx',
    './src/features/**/*.tsx',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/line-clamp')],
}
