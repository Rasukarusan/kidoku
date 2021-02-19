import { useEffect } from 'react'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { ResultCard, SelectList } from '@/components/ResultCard'
import { Item } from '@/components/InputField'

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
  },
})

export interface Results {
  [key: string]: Item[]
}

interface Props {
  results: Results
  titles: string[]
  selectList: SelectList
  updateSelectList: (newSelectList: SelectList) => void
}
export const ResultArea: React.FC<Props> = ({
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
            <Typography
              color="primary"
              variant="h5"
              className={classes.resultTitle}
            >
              『{title}』の検索結果
            </Typography>
            <div className={classes.resultArea}>
              {Array.isArray(results[title]) &&
                results[title].map((item: Item, index: number) => (
                  <div
                    className={classes.resultItem}
                    key={`${index}- ${item.volumeInfo.title}`}
                  >
                    <ResultCard
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
