import { useState, useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { makeStyles } from '@material-ui/core/styles'
import { Typography, TextField } from '@material-ui/core'
import { InputField } from '@/components/InputField'
import { Header } from '@/components/Header'
import { ResultArea, Results } from '@/components/ResultArea'
import { SelectList } from '@/components/ResultCard'

const useStyles = makeStyles({
  title: {
    margin: 10,
    fontWeight: 'bold',
  },
})

const IndexPage = () => {
  const [selectList, setSelectList] = useState<SelectList>({})
  const [results, setResults] = useState<Results>({})
  const classes = useStyles()
  const title = '著者検索'

  const updateResults = (newResults: Results) => {
    setResults(newResults)
    setSelectList({})
  }

  const updateSelectList = (newSelectList: SelectList) => {
    setSelectList(newSelectList)
  }

  const getList = () => {
    let list = ''
    Object.keys(selectList).forEach((key) => {
      list += key + '\t' + selectList[key].authors + '\n'
    })
    return list
  }

  return (
    <Layout>
      <Header title={title} />
      <Typography variant="h2" className={classes.title}>
        {title}
      </Typography>

      <InputField setResults={updateResults} />
      <TextField
        style={{ width: '50%' }}
        defaultValue={getList()}
        multiline
        rows={10}
        disabled
        variant="outlined"
      />
      <ResultArea
        results={results}
        selectList={selectList}
        updateSelectList={updateSelectList}
      />
    </Layout>
  )
}
export default IndexPage
