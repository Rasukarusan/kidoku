import React from 'react'
import Head from 'next/head'
import { Analytics } from '@vercel/analytics/react'
import { Header, Footer } from '@/features/global'
import { LoadingTopBar } from '@/features/global/components/LoadingTopBar'
import { DefaultSeo } from 'next-seo'
import SEO from '../../next-seo.config'
import './global.css'
import { SessionProvider } from 'next-auth/react'
import { Layout } from '@/components/layout/Layout'
import { Provider } from 'jotai'
import { AppProps } from 'next/app'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <DefaultSeo {...SEO} />
      <Provider>
        <SessionProvider session={pageProps.session}>
          <LoadingTopBar />
          <Layout>
            <Header />
            <Component {...pageProps} />
            <Analytics />
          </Layout>
          <Footer />
        </SessionProvider>
      </Provider>
    </>
  )
}
