import { JetBrains_Mono, Kosugi, Noto_Sans_JP } from 'next/font/google'
// import { Zen_Maru } from 'next/font/google'

export const kosugi = Kosugi({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-kosugi',
  display: 'swap',
})

export const notojp = Noto_Sans_JP({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-notojp',
  display: 'swap',
})

// CLIモードで等幅表示するためのフォント（日本語はNoto Sans JPにフォールバック）
export const mono = JetBrains_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})
