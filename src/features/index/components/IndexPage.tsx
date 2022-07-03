import { useState } from 'react'
import { Container } from '@material-ui/core'
import { Grid } from '@material-ui/core'
import { H2 } from '@/components/Label/H2'
import { Results, SelectList } from '../types'
import { InputField, Area as ResultArea, CopyField } from './'

export const IndexPage = () => {
  const [titles, setTitles] = useState<string[]>([])
  const [selectList, setSelectList] = useState<SelectList>({})
  const [results, setResults] = useState<Results>({})

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
    <Container fixed>
      <H2 title="著者検索 neo" />
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
    </Container>
  )
}
