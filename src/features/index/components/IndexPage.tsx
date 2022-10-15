import { useState } from 'react'
import { Container, Grid } from '@mui/material'
import { Results } from '../types'
import { InputField, Area as ResultArea, CopyField } from './'

export const IndexPage = () => {
  const [searchWords, setSearchWords] = useState<string[]>([])
  const [results, setResults] = useState<Results>({})

  const updateSearchWords = (newSearchWords: string[]) => {
    setSearchWords(newSearchWords)
  }

  const updateResults = (newResults: Results) => {
    setResults(newResults)
  }

  return (
    <>
      <button
        onClick={async () => {
          const body = { name: 'hogeeee' }
          const res = await fetch('/api/write', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          })
            .then((res) => res.json())
            .then((json) => json)
          console.log(res)
        }}
      >
        submit
      </button>
      <Container fixed sx={{ paddingTop: '32px' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InputField
              setSearchWords={updateSearchWords}
              setResults={updateResults}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CopyField />
          </Grid>
        </Grid>
        <ResultArea results={results} searchWords={searchWords} />
      </Container>
    </>
  )
}
