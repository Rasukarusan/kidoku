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
import type { ReactElement } from 'react'
import type { AppProps } from 'next/app'
import type { NextPageWithLayout } from '@/types/page'
import { ApolloProvider } from '@apollo/client'
import apolloClient from '@/libs/apollo'
import { StoreAccessToken } from '@/features/global/components/StoreAccessToken'
import { UiModeProvider } from '@/features/ui-mode/UiModeProvider'

const defaultLayout = (page: ReactElement) => (
  <Layout>
    <Header />
    {page}
    <Footer />
  </Layout>
)

export default function MyApp({
  Component,
  pageProps,
}: AppProps & { Component: NextPageWithLayout }) {
  const getLayout = Component.getLayout ?? defaultLayout
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
        <ApolloProvider client={apolloClient}>
          <SessionProvider session={pageProps.session}>
            <StoreAccessToken />
            <LoadingTopBar />
            <UiModeProvider>
              {getLayout(<Component {...pageProps} />)}
              <Analytics />
            </UiModeProvider>
          </SessionProvider>
        </ApolloProvider>
      </Provider>
    </>
  )
}
