import { YearlyTopBook } from './types'
import { uniq } from '@/utils/array'
import { makeStyles } from '@mui/styles'
import { Book } from './Book'

const useStyles = makeStyles({
  title: {
    fontSize: '30px',
    position: 'relative',
    padding: '0.25em 3em',
    borderTop: 'solid 2px black',
    borderBottom: 'solid 2px black',
    '&::before,&::after': {
      content: "''",
      position: 'absolute',
      top: '-7px',
      width: '2px',
      height: 'calc(100% + 14px)',
      backgroundColor: 'black',
    },
    '&::before': {
      left: '7px',
    },
    '&::after': {
      right: '7px',
    },
  },
})

interface Props {
  yearlyTopBooks: YearlyTopBook[]
}

export const Rankings: React.FC<Props> = ({ yearlyTopBooks }) => {
  const classes = useStyles()
  // 年は降順、順位は昇順で並び替える
  const books = yearlyTopBooks
    .map((book) => {
      const {
        year,
        order,
        book: { title, author, image },
      } = book
      return { year, order, title, author, image }
    })
    .sort((a, b) => {
      if (a.year === b.year) {
        return a.order - b.order
      }
      return a.year < b.year ? 1 : -1
    })
  const years = uniq(yearlyTopBooks.map((book) => book.year)).sort(
    (a, b) => a > b
  )
  return (
    <div className="mt-8">
      {years.map((year) => {
        const yearBooks = books.filter((book) => book.year === year)
        return (
          <>
            <span className={classes.title}>{year}</span>
            <div className="block sm:flex justify-around mt-8">
              {yearBooks.map((book, i) => (
                <Book key={`${book.title}-${i}`} book={book} />
              ))}
            </div>
          </>
        )
      })}
    </div>
  )
}
