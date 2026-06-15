import React from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'
import { kosugi, notojp } from '@/libs/fonts'

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="ja" className={`${kosugi.variable} ${notojp.variable}`}>
        <Head>
          {/* PWA primary color */}
          <meta name="theme-color" content="#0f766e" />
          <meta
            name="description"
            content="本のタイトルから著者・カテゴリ・書影を検索できます。"
          />
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="/logo.png" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-title" content="kidoku" />
          <link
            href="https://fonts.googleapis.com/earlyaccess/nicomoji.css"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
