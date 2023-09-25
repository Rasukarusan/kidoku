import { Record } from '../types'
import { YearlyTopBook } from '@/types/book'
import { useState } from 'react'
import { YearlyTopBooksModal } from './YearlyTopBooksModal'

interface Props {
  books: Record[]
  year: string
  yearlyTopBooks: YearlyTopBook[]
}

export const YearlyTopBooks: React.FC<Props> = ({
  books,
  year,
  yearlyTopBooks,
}) => {
  const [open, setOpen] = useState(false)
  const [order, setOrder] = useState(null)

  const onClickAdd = (order: number) => {
    setOpen(true)
    setOrder(order)
    document.body.classList.add('no-scroll')
  }

  return (
    <>
      <YearlyTopBooksModal
        books={books}
        open={open}
        onClose={() => {
          setOpen(false)
          document.body.classList.remove('no-scroll')
        }}
        year={year}
        order={order}
        yearlyTopBooks={yearlyTopBooks}
      />
      <div className="text-center mb-8">
        <div className="title mb-4">{year}年トップ３</div>
        <div className="flex justify-between">
          {[1, 2, 3].map((v) => {
            const yearlyTopBook = yearlyTopBooks
              .filter((book) => book.order === v)
              .pop()
            return (
              <div
                key={v}
                className="text-center hover:opacity-90"
                style={{ order: v === 3 ? 0 : v }}
              >
                <button
                  className="bg-gray-100 rounded-md w-32 h-36 hover:bg-gray-200 text-2xl mb-1 w-[128px] h-[186px] shadow-md"
                  onClick={() => onClickAdd(v)}
                >
                  {yearlyTopBook ? (
                    <img
                      src={yearlyTopBook.book.image}
                      alt=""
                      width={128}
                      height={186}
                    />
                  ) : (
                    <span>+</span>
                  )}
                </button>
                <div className="">{v}位</div>
              </div>
            )
          })}
        </div>
        <style jsx>{`
          .title {
            position: relative;
            display: inline-block;
            padding: 0 55px;
          }
          .title::before,
          .title::after {
            content: '';
            position: absolute;
            top: 50%;
            display: inline-block;
            width: 45px;
            height: 1px;
            background-color: black;
          }
          .title::before {
            left: 0;
          }
          .title.::after {
            right: 0;
          }
        `}</style>
      </div>
    </>
  )
}
