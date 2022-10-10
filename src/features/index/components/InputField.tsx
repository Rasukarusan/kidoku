import { useRef, useState } from 'react'
import { useKey } from 'react-use'
import { TextField } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { Autocomplete } from '@mui/material'
import { Results } from '../types'
import { getSuggestions, searchBooks } from '../util'

const useStyles = makeStyles({
  input: {
    '& label': {
      fontFamily: 'Nico Moji',
    },
  },
  suggestTextField: {
    '& .MuiInput-underline:before': {
      borderBottomColor: 'transparent',
    },
    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
      borderBottomColor: 'transparent',
    },
  },
  suggestInput: {
    color: 'transparent',
    marginTop: '-35px',
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
    const suggestPopup = document.getElementById('suggestion-listbox')
    if (suggestPopup) {
      suggestRef.current.focus()
      inputRef.current.blur()
    }
  })
  useKey('ArrowUp', () => {
    const suggestPopup = document.getElementById('suggestion-listbox')
    if (suggestPopup) {
      suggestRef.current.focus()
      inputRef.current.blur()
    }
  })

  useKey('Enter', () => {
    inputRef.current.focus()
  })

  /**
   * サジェスト取得しポップアップを表示状態にする
   */
  const getSuggest = async (keyword: string) => {
    const suggestions = await getSuggestions(keyword)
    // 重複を削除
    const s = Array.from(new Set(suggestions))
    setOptions(s)
    setOpenSuggest(s && s.length > 0)
  }

  const handleOnChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const titles = event.target.value.split('\n').filter((v) => v !== '')
    const lastTitle = event.target.value.split('\n').slice(-1)[0]

    // サジェスト取得
    getSuggest(lastTitle)
    // タイトル入力とサジェストのテキストフィールドを同期
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
        className={classes.input}
        label="タイトルを1ぎょうずつにゅうりょく"
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
        clearIcon={<></>}
        renderInput={(params) => (
          <TextField
            {...params}
            autoComplete="off"
            className={classes.suggestTextField}
            inputRef={suggestRef}
            onChange={onSuggestChange}
            variant="standard"
            inputProps={{
              ...params.inputProps,
              className: classes.suggestInput,
            }}
          />
        )}
      />
    </>
  )
}
