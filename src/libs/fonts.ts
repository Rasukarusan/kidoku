import { Kosugi, Noto_Sans_JP } from 'next/font/google'
// import { Zen_Maru } from 'next/font/google'

export const kosugi = Kosugi({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-kosugi',
})

export const notojp = Noto_Sans_JP({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-notojp',
})
