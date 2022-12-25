import { useRecoilValue } from 'recoil'
import { useState } from 'react'
import { Container, Grid } from '@mui/material'
import { isLoginAtom } from '@/store/isLogin'
import { Results } from '../types'
import { InputField, Area as ResultArea, CopyField, AddButton } from './'

export const IndexPage = () => {
  const isLogin = useRecoilValue(isLoginAtom)
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
            {isLogin && searchWords.length > 0 && <AddButton />}
          </Grid>
        </Grid>
        <ResultArea results={results} searchWords={searchWords} />
      </Container>
    </>
  )
}
