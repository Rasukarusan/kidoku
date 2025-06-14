import React from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'
import { kosugi, notojp } from '@/libs/fonts'

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="ja" className={`${kosugi.variable} ${notojp.variable}`}>
        <Head>
          {/* PWA primary color */}
          <meta name="theme-color" />
          <meta
            name="description"
            content="本のタイトルから著者・カテゴリ・書影を検索できます。"
          />
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
