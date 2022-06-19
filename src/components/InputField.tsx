import { TextField } from '@material-ui/core'
import { useRef, useState } from 'react'
import { Results } from './ResultArea'
import { makeStyles } from '@material-ui/core/styles'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { useKey } from 'react-use'
import { getSuggestions, searchBooks } from './util'

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
  const [openSuggest, setOpenSuggest] = useState(false)
  const inputRef = useRef(null)
  const suggestRef = useRef(null)

  // 選択中のサジェストのインデックス
  useKey('ArrowDown', () => {
    const suggestPopup = document.getElementById('suggestion-popup')
    if (suggestPopup) {
      suggestRef.current.focus()
      inputRef.current.blur()
    }
  })
  useKey('ArrowUp', () => {
    const suggestPopup = document.getElementById('suggestion-popup')
    if (suggestPopup) {
      suggestRef.current.focus()
      inputRef.current.blur()
    }
  })

  useKey('Enter', () => {
    inputRef.current.focus()
  })

  const suggest = async (keyword: string) => {
    const suggestions = await getSuggestions(keyword)
    setOptions(suggestions)
    setOpenSuggest(suggestions && suggestions.length > 0)
  }

  const handleOnChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const titles = event.target.value.split('\n').filter((v) => v !== '')
    const lastTitle = event.target.value.split('\n').slice(-1)[0]
    console.log(lastTitle)

    // ENTERを押下した場合
    const suggestPopup = document.getElementById('suggestion-popup')
    if (suggestPopup && lastTitle === '') {
      document.querySelectorAll('.MuiAutocomplete-option').forEach((item) => {
        const option = document.getElementById(item.id)
        if (option.dataset.focus === 'true') {
          const values = titles.slice(0, -1)
          setValue([...values, item.textContent].join('\n'))
          setOptions([])
          setOpenSuggest(false)
        }
      })
      return
    }

    suggest(lastTitle)
    setSuggestWord(lastTitle)
    setValue(event.target.value)

    if (timer) clearTimeout(timer)
    const newTimer = setTimeout(async () => {
      const results = {}
      await Promise.all(
        titles.map(async (title) => {
          results[title] = await searchBooks(title)
        })
      )
      setResults(results)
      setTitles(titles)
    }, 200)
    setTimer(newTimer)
  }

  /**
   * サジェスト選択中に単語を全部消したらフォーカスをもとに戻す
   */
  const onSuggestChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === '') {
      inputRef.current.focus()
    }
  }

  return (
    <>
      <TextField
        inputRef={inputRef}
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
        id="suggestion"
        freeSolo={true}
        open={openSuggest}
        value={suggestWord}
        onChange={(event, newValue) => {
          const values = value
            .split('\n')
            .filter((v) => v !== '')
            .slice(0, -1)
          setValue([...values, newValue].join('\n'))
          setOptions([])
          setOpenSuggest(false)
        }}
        options={options}
        filterOptions={(options) => options}
        renderInput={(params) => (
          <div>
            <TextField
              {...params}
              variant="outlined"
              inputRef={suggestRef}
              onChange={onSuggestChange}
            />
          </div>
        )}
      />
    </>
  )
}
