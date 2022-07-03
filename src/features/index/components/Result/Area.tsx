import { useEffect } from 'react'
import { OpenInNew } from '@material-ui/icons'
import { Typography, Link } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Results, Item, CopyList, CopyItem } from '../../types'
import { Card } from './Card'

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
  copyList: CopyList
  updateCopyList: (key: string, item: CopyItem) => void
}
export const Area: React.FC<Props> = ({
  results,
  titles,
  copyList,
  updateCopyList,
}) => {
  const classes = useStyles()

  useEffect(() => {
    Object.keys(results).map((key) => {
      if (!copyList[key]) {
        const { title, authors, categories } = results[key][0].volumeInfo
        updateCopyList(key, { title, authors, categories })
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
                        copyList[title]
                          ? copyList[title].title === item.volumeInfo.title
                          : false
                      }
                      updateCopyList={updateCopyList}
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
