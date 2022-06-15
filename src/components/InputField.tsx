import axios from 'axios'
import { TextField } from '@material-ui/core'
import { useState } from 'react'
import { Results } from './ResultArea'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  root: {
    '& label': {
      fontFamily: 'Stick-Regular',
    },
  },
})

interface ImageLinks {
  smallThumbnail: string
  thumbnail: string
}

interface VolumeInfo {
  allowAnonLogging: boolean
  authors?: string[]
  canonicalVolumeLink: string
  categories: string[]
  contentVersion: string
  description?: string
  imageLinks?: ImageLinks
  industryIdentifiers: any
  infoLink: string
  language: string
  maturityRating: string
  previewLink: string
  printType: string
  publishedDate: string
  publisher: string
  readingModes: any
  subtitle: string
  title: string
}

export interface Item {
  // TODO: volumeInfo以外は使わないのでanyにしておく
  accessInfo: any
  etag: string
  id: string
  kind: string
  saleInfo: any
  searchInfo: any
  selfLink: string
  volumeInfo: VolumeInfo
}

interface Props {
  setTitles: (newTitles: string[]) => void
  setResults: (newResults: Results) => void
}
export const InputField: React.FC<Props> = ({ setTitles, setResults }) => {
  const classes = useStyles()
  const [timer, setTimer] = useState(null)
  const search = async (title: string): Promise<Item[]> => {
    return axios
      .get(`https://www.googleapis.com/books/v1/volumes?q=${title}`)
      .then((res) => res.data.items)
  }

  const handleOnChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const titles = event.target.value.split('\n').filter((v) => v !== '')
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
    <TextField
      className={classes.root}
      label="本のタイトルを1行ずつ入力"
      multiline
      fullWidth
      minRows={10}
      variant="outlined"
      onChange={handleOnChange}
    />
  )
}
