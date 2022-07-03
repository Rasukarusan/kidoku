import { useState, Suspense } from 'react'
import { Container, Grid, CircularProgress, Box } from '@material-ui/core'
import { H2 } from '@/components/Label/H2'
import { Results, CopyList } from '../types'
import { InputField, Area as ResultArea, CopyField } from './'
import { Loading } from './Loading'

export const IndexPage = () => {
  const [titles, setTitles] = useState<string[]>([])
  const [copyList, setCopyList] = useState<CopyList>({})
  const [results, setResults] = useState<Results>({})
  const [loading, setLoading] = useState(true)

  const updateTitles = (newTitles: string[]) => {
    setTitles(newTitles)
  }

  const updateResults = (newResults: Results) => {
    setResults(newResults)
    setCopyList({})
  }

  const updateCopyList = (newCopyList: CopyList) => {
    setCopyList(newCopyList)
  }

  return (
    <Container fixed>
      <H2 title="著者検索 neo" />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <InputField setTitles={updateTitles} setResults={updateResults} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CopyField titles={titles} copyList={copyList} />
        </Grid>
      </Grid>
      <Suspense fallback={<Loading />}>
        <ResultArea
          results={results}
          titles={titles}
          copyList={copyList}
          updateCopyList={updateCopyList}
        />
      </Suspense>
    </Container>
  )
}
