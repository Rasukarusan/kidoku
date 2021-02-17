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

export const ResultArea = ({ results }) => {
  const classes = useStyles()
  return (
    <div>
      {Object.keys(results).map((key, i) => (
        <div key={`${i}-${key}`}>
          <Typography
            color="primary"
            variant="h5"
            className={classes.resultTitle}
          >
            『{key}』の検索結果
          </Typography>
          <div className={classes.resultArea}>
            {results[key].map((item) => (
              <div className={classes.resultItem} key={item.volumeInfo.title}>
                <ResultCard
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
      ))}
    </div>
  )
}
