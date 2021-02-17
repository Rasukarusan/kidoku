import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { makeStyles } from '@material-ui/core/styles'
import { Typography } from '@material-ui/core'
import { InputField } from '@/components/InputField'
import { Header } from '@/components/Header'
import { ResultArea, Results } from '@/components/ResultArea'
import { SelectList } from '@/components/ResultCard'
import { CopyField } from '@/components/CopyField'

const useStyles = makeStyles({
  title: {
    margin: 10,
    fontWeight: 'bold',
  },
})

const IndexPage = () => {
  const [titles, setTitles] = useState<string[]>([])
  const [selectList, setSelectList] = useState<SelectList>({})
  const [results, setResults] = useState<Results>({})
  const classes = useStyles()
  const title = '著者検索'

  const updateTitles = (newTitles: string[]) => {
    setTitles(newTitles)
  }

  const updateResults = (newResults: Results) => {
    setResults(newResults)
    setSelectList({})
  }

  const updateSelectList = (newSelectList: SelectList) => {
    setSelectList(newSelectList)
  }

  return (
    <Layout>
      <Header title={title} />
      <Typography variant="h2" className={classes.title}>
        {title}
      </Typography>
      <InputField setTitles={updateTitles} setResults={updateResults} />
      <CopyField titles={titles} selectList={selectList} />
      <ResultArea
        results={results}
        titles={titles}
        selectList={selectList}
        updateSelectList={updateSelectList}
      />
    </Layout>
  )
}
export default IndexPage
