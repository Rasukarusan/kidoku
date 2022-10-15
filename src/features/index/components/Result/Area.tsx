import { useEffect } from 'react'
import { OpenInNew } from '@mui/icons-material'
import { Typography, Link } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { Results, Item } from '../../types'
import { Card } from './Card'
import { useRecoilState } from 'recoil'
import { selectItemsAtom } from '@/store/selectItems'

const useStyles = makeStyles({
  area: {
    display: 'flex',
    overflowX: 'scroll',
  },
  item: {
    display: 'inline-block',
  },
  title: {
    paddingTop: 20,
    paddingBottom: 10,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
})
interface Props {
  results: Results
  titles: string[]
}
export const Area: React.FC<Props> = ({ results, titles }) => {
  const classes = useStyles()
  const [selectItems, setSelectItems] = useRecoilState(selectItemsAtom)

  useEffect(() => {
    Object.keys(results).map((key) => {
      if (!selectItems[key] && results[key]) {
        const { title, authors, categories, imageLinks } =
          results[key][0].volumeInfo
        setSelectItems({
          ...selectItems,
          [key]: {
            title,
            authors,
            categories,
            imageLink: imageLinks ? imageLinks.thumbnail : '/no-image.png',
          },
        })
      }
    })
  })
  return (
    <div style={{ marginBottom: '100px' }}>
      {titles.map((title: string, i: number) => {
        return (
          <div key={`${i}-${title}`}>
            <Link
              target="_blank"
              rel="noreferrer"
              href={`https://www.amazon.co.jp/s?k=${title}`}
            >
              <Typography
                color="primary"
                variant="h5"
                className={classes.title}
              >
                『{title}』の検索結果
                <OpenInNew style={{ paddingLeft: 5 }} />
              </Typography>
            </Link>
            <div className={classes.area}>
              {Array.isArray(results[title]) &&
                results[title].map((item: Item, index: number) => (
                  <div
                    className={classes.item}
                    key={`${index}- ${item.volumeInfo.title}`}
                  >
                    <Card
                      isChecked={
                        selectItems[title]
                          ? selectItems[title].title === item.volumeInfo.title
                          : false
                      }
                      searchWord={title}
                      volumeInfo={item.volumeInfo}
                    />
                  </div>
                ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
