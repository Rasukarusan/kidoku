import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { makeStyles } from '@material-ui/core/styles'
import { InputField } from '@/components/InputField'
import { Header } from '@/components/Header'
import { ResultArea, Results } from '@/components/ResultArea'

const useStyles = makeStyles({
  title: {
    margin: 10,
    lineHeight: 1.15,
    fontSize: '4rem',
  },
})

const IndexPage = () => {
  const [selected, setSelected] = useState({})
  const [results, setResults] = useState<Results>({})
  const classes = useStyles()
  const title = '著者検索👌'
  return (
    <Layout>
      <Header title={title} />
      <h1 className={classes.title}>{title}</h1>
      <InputField setResults={setResults} />
      <h1 className={classes.title}>結果</h1>
      <ResultArea results={results} />
    </Layout>
  )
}
export default IndexPage
