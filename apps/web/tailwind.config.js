/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.tsx',
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
        'ai-summary': '#f7f6f3',
      },
      fontSize: {
        '2xs': '0.5rem',
      },
      keyframes: {
        scan: {
          '0%': { top: '0' },
          '50%': { top: 'calc(100% - 2px)' },
          '100%': { top: '0' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        scan: 'scan 2s ease-in-out infinite',
        'scale-in': 'scale-in 0.5s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
      },
    },
  },
  plugins: [],
}
