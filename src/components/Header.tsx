import Head from 'next/head'
export const Header = ({ title }) => {
  return (
    <Head>
      <title>{title}</title>
      <link rel="icon" href="/favicon.png" />
    </Head>
  )
}
