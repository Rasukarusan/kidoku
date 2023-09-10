import { useState } from 'react'
import { Container, Grid } from '@mui/material'
import { Results } from '../types'
import { InputField, Area as ResultArea, CopyField, AddButton } from './'
import { useSession } from 'next-auth/react'

export const IndexPage = () => {
  const { data: session } = useSession()
  const [searchWords, setSearchWords] = useState<string[]>([])
  const [results, setResults] = useState<Results>({})
  const [openSuggest, setOpenSuggest] = useState(false)

  const updateSearchWords = (newSearchWords: string[]) => {
    setSearchWords(newSearchWords)
  }

  const updateResults = (newResults: Results) => {
    setResults(newResults)
  }

  const onClickBody = () => {
    setOpenSuggest(false)
  }

  return (
    <div onClick={onClickBody}>
      <Container fixed sx={{ paddingTop: '32px' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InputField
              setSearchWords={updateSearchWords}
              setResults={updateResults}
              openSuggest={openSuggest}
              setOpenSuggest={setOpenSuggest}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CopyField />
            {session && searchWords.length > 0 && <AddButton />}
          </Grid>
        </Grid>
        <ResultArea results={results} searchWords={searchWords} />
      </Container>
    </div>
  )
}
