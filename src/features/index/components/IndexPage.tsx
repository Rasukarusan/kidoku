import { useState } from 'react'
import { Container, Grid } from '@material-ui/core'
import { H2 } from '@/components/Label/H2'
import { Results, CopyList, CopyItem } from '../types'
import { SheetLink, InputField, Area as ResultArea, CopyField } from './'
export const IndexPage = () => {
  const [titles, setTitles] = useState<string[]>([])
  const [copyList, setCopyList] = useState<CopyList>({})
  const [results, setResults] = useState<Results>({})

  const updateTitles = (newTitles: string[]) => {
    setTitles(newTitles)
  }

  const updateResults = (newResults: Results) => {
    setResults(newResults)
    setCopyList({})
  }

  const updateCopyList = (key: string, item: CopyItem) => {
    setCopyList({ ...copyList, [key]: item })
  }

  return (
    <Container fixed>
      <H2 title="著者検索 neo" />
      <SheetLink />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <InputField setTitles={updateTitles} setResults={updateResults} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CopyField titles={titles} copyList={copyList} />
        </Grid>
      </Grid>
      <ResultArea
        results={results}
        titles={titles}
        copyList={copyList}
        updateCopyList={updateCopyList}
      />
    </Container>
  )
}
