import axios from 'axios'
import { TextField } from '@material-ui/core'
import { useState } from 'react'
import { Results } from './ResultArea'
import { makeStyles } from '@material-ui/core/styles'
import { Item } from './types'
import Autocomplete from '@material-ui/lab/Autocomplete'

const useStyles = makeStyles({
  root: {
    '& label': {
      fontFamily: 'Stick-Regular',
    },
  },
})

interface Props {
  setTitles: (newTitles: string[]) => void
  setResults: (newResults: Results) => void
}

export const InputField: React.FC<Props> = ({ setTitles, setResults }) => {
  const classes = useStyles()
  const [timer, setTimer] = useState(null)
  const [options, setOptions] = useState([])
  const [value, setValue] = useState('')
  const [suggestWord, setSuggestWord] = useState('')
  const search = async (title: string): Promise<Item[]> => {
    return axios
      .get(`https://www.googleapis.com/books/v1/volumes?q=${title}`)
      .then((res) => res.data.items)
  }

  const suggest = (keyword: string) => {
    const url = encodeURI(
      `https://completion.amazon.co.jp/api/2017/suggestions?limit=11&prefix=${keyword}&suggestion-type=WIDGET&suggestion-type=KEYWORD&page-type=Gateway&alias=aps&site-variant=desktop&version=3&event=onKeyPress&wc=&lop=ja_JP&avg-ks-time=995&fb=1&plain-mid=6&client-info=amazon-search-ui`
    )
    axios.get(url).then((res) => {
      console.log(res.data.suggestions)
      const suggestions = res.data.suggestions.map(
        (suggestion) => suggestion.value
      )
      setOptions(suggestions)
    })
  }

  const handleOnChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const titles = event.target.value.split('\n').filter((v) => v !== '')
    const lastTitle = titles.slice(-1)[0]
    suggest(lastTitle)
    setSuggestWord(lastTitle)
    setValue(event.target.value)
    if (timer) clearTimeout(timer)
    const newTimer = setTimeout(async () => {
      const results = {}
      await Promise.all(
        titles.map(async (title) => {
          results[title] = await search(title)
        })
      )
      setResults(results)
      setTitles(titles)
    }, 200)
    setTimer(newTimer)
  }

  return (
    <>
      <TextField
        className={classes.root}
        label="本のタイトルを1行ずつ入力"
        multiline
        fullWidth
        minRows={10}
        variant="outlined"
        onChange={handleOnChange}
        value={value}
      />
      <Autocomplete
        open={true}
        value={suggestWord}
        onChange={(event, newValue) => {
          const values = value
            .split('\n')
            .filter((v) => v !== '')
            .slice(0, -1)
          setValue([...values, newValue].join('\n'))
        }}
        onInputChange={(event, newInputValue) => {
          console.log('hoge', newInputValue)
          suggest(newInputValue)
        }}
        id="controllable-states-demo"
        options={options}
        filterOptions={(options) => options}
        renderInput={(params) => (
          <div>
            <TextField {...params} variant="outlined" />
          </div>
        )}
      />
    </>
  )
}
