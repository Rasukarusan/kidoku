import Head from 'next/head'
import Link from 'next/link'
import { Layout } from '@/components/layout'
import { Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  container: {
    minHeight: '100vh',
    padding: '0 0.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  main: {
    padding: '5rem 0',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    lineHeight: 1.15,
    fontSize: '4rem',
  },
  description: {
    lineHeight: '1.5',
    fontSize: '1.5rem',
  },
})
const IndexPage = () => {
  const classes = useStyles()
  return (
    <Layout>
      <div className={classes.container}>
        <Head>
          <title>NextJS Typescript Starter</title>
          <link rel="icon" href="/favicon.png" />
        </Head>

        <div className={classes.main}>
          <h1 className={classes.title}>NextJS Typescript Starter</h1>
          <p className={classes.description}>
            Read{' '}
            <Link href="https://github.com/Rasukarusan/nextjs-typescript-starter">
              <a target="_blank">github</a>
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  )
}
export default IndexPage
