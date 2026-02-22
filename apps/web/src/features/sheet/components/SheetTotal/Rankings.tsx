import { YearlyTopBook } from '@/types/book'
import { uniq } from '@/utils/array'
import { Book } from './Book'
import { Fragment } from 'react'

interface Props {
  yearlyTopBooks: YearlyTopBook[]
}

export const Rankings: React.FC<Props> = ({ yearlyTopBooks }) => {
  // 年は降順、順位は昇順で並び替える
  const books = yearlyTopBooks
    .map((book) => {
      const {
        year,
        order,
        book: { id, title, author, image, memo, isPublicMemo },
      } = book
      return { year, order, id, title, author, image, memo, isPublicMemo }
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
          <Fragment key={year}>
            <span className="title">{year}</span>
            <div className="mx-auto mt-8 max-w-2xl">
              {yearBooks.map((book, i) => (
                <Book key={`${book.title}-${i}`} book={book} />
              ))}
            </div>
          </Fragment>
        )
      })}
      <style jsx>{`
        .title {
          font-size: 30px;
          position: relative;
          padding: 0.25em 3em;
          border-top: solid 2px black;
          border-bottom: solid 2px black;
        }
        .title::before,
        .title::after {
          content: '';
          position: absolute;
          top: -7px;
          width: 2px;
          height: calc(100% + 14px);
          background-color: black;
        }
        .title::before {
          left: 7px;
        }
        .title::after {
          right: 7px;
        }
      `}</style>
    </div>
  )
}
