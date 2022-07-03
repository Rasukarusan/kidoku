import { useEffect } from 'react'
import { OpenInNew } from '@material-ui/icons'
import { Typography, Link } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Card, SelectList } from './'
import { Results, Item } from '../types'

const useStyles = makeStyles({
  resultArea: {
    display: 'flex',
    overflowX: 'scroll',
  },
  resultItem: {
    display: 'inline-block',
  },
  resultTitle: {
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
  selectList: SelectList
  updateSelectList: (newSelectList: SelectList) => void
}
export const Area: React.FC<Props> = ({
  results,
  titles,
  selectList,
  updateSelectList,
}) => {
  const classes = useStyles()

  useEffect(() => {
    Object.keys(results).map((key) => {
      if (!selectList[key]) {
        updateSelectList({
          ...selectList,
          [key]: {
            title: results[key][0].volumeInfo.title,
            authors: results[key][0].volumeInfo.authors,
            categories: results[key][0].volumeInfo.categories,
          },
        })
      }
    })
  })
  return (
    <div>
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
                className={classes.resultTitle}
              >
                『{title}』の検索結果
                <OpenInNew style={{ paddingLeft: 5 }} />
              </Typography>
            </Link>
            <div className={classes.resultArea}>
              {Array.isArray(results[title]) &&
                results[title].map((item: Item, index: number) => (
                  <div
                    className={classes.resultItem}
                    key={`${index}- ${item.volumeInfo.title}`}
                  >
                    <Card
                      selectList={
                        selectList[title]
                          ? selectList
                          : {
                              [title]: {
                                title: results[title][0].volumeInfo.title,
                                authors: results[title][0].volumeInfo.authors,
                                categories:
                                  results[title][0].volumeInfo.categories,
                              },
                            }
                      }
                      updateSelectList={updateSelectList}
                      searchWord={title}
                      title={item.volumeInfo.title}
                      imageUrl={
                        item.volumeInfo.imageLinks
                          ? item.volumeInfo.imageLinks.thumbnail
                          : '/no-image.png'
                      }
                      description={item.volumeInfo.description}
                      authors={item.volumeInfo.authors}
                      categories={item.volumeInfo.categories}
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
