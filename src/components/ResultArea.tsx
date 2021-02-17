import { useEffect } from 'react'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { ResultCard } from '@/components/ResultCard'
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

export const ResultArea = ({ results, selectList, updateSelectList }) => {
  const classes = useStyles()

  useEffect(() => {
    Object.keys(results).map((key) => {
      if (!selectList[key]) {
        updateSelectList({
          ...selectList,
          [key]: {
            title: results[key][0].volumeInfo.title,
            authors: results[key][0].volumeInfo.authors,
          },
        })
      }
    })
  })
  return (
    <div>
      {Object.keys(results).map((key, i) => {
        return (
          <div key={`${i}-${key}`}>
            <Typography
              color="primary"
              variant="h5"
              className={classes.resultTitle}
            >
              『{key}』の検索結果
            </Typography>
            <div className={classes.resultArea}>
              {Array.isArray(results[key]) &&
                results[key].map((item: Item) => (
                  <div
                    className={classes.resultItem}
                    key={item.volumeInfo.title}
                  >
                    <ResultCard
                      selectList={
                        selectList[key]
                          ? selectList
                          : {
                              [key]: {
                                title: results[key][0].volumeInfo.title,
                                authors: results[key][0].volumeInfo.authors,
                              },
                            }
                      }
                      updateSelectList={updateSelectList}
                      searchWord={key}
                      title={item.volumeInfo.title}
                      imageUrl={
                        item.volumeInfo.imageLinks
                          ? item.volumeInfo.imageLinks.thumbnail
                          : '/no-image.png'
                      }
                      description={item.volumeInfo.description}
                      authors={item.volumeInfo.authors}
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
