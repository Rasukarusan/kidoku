import type { ReactElement, ReactNode } from 'react'
import type { NextPage } from 'next'

// Pages can replace the app shell (header, sidebar, footer) by defining getLayout.
export type NextPageWithLayout<P = object> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode
}
