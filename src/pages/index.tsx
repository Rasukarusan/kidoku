import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { makeStyles } from '@material-ui/core/styles'
import { Typography, Grid } from '@material-ui/core'
import { InputField } from '@/components/InputField'
import { Header } from '@/components/Header'
import { ResultArea, Results } from '@/components/ResultArea'
import { SelectList } from '@/components/ResultCard'
import { CopyField } from '@/components/CopyField'

const useStyles = makeStyles({
  title: {
    margin: 10,
    fontFamily: 'Stick-Regular',
  },
})

const IndexPage = () => {
  const [titles, setTitles] = useState<string[]>([])
  const [selectList, setSelectList] = useState<SelectList>({})
  const [results, setResults] = useState<Results>({})
  const classes = useStyles()
  const title = '著者検索 neo'

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
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <InputField setTitles={updateTitles} setResults={updateResults} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CopyField titles={titles} selectList={selectList} />
        </Grid>
      </Grid>

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
