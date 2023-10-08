import { Book } from '@/types/book'
import { YearlyTopBook } from '@/types/book'
import { useState } from 'react'
import { YearlyTopBooksModal } from './YearlyTopBooksModal'
import { useSession } from 'next-auth/react'
import { TitleWithLine } from '@/components/label/TitleWithLine'

interface Props {
  books: Book[]
  year: string
  yearlyTopBooks: YearlyTopBook[]
}

export const YearlyTopBooks: React.FC<Props> = ({
  books,
  year,
  yearlyTopBooks,
}) => {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [order, setOrder] = useState(null)
  const isMine =
    session && books.length > 0 && session.user.id === books[0].userId

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
        <div className="mb-4">
          <TitleWithLine text={`${year}年トップ３`} />
        </div>
        <div className="flex justify-between">
          {[1, 2, 3].map((v) => {
            const yearlyTopBook = yearlyTopBooks
              .filter((book) => book.order === v)
              .pop()
            return (
              <div
                key={v}
                className="text-center"
                style={{ order: v === 3 ? 0 : v }}
              >
                <button
                  className={`bg-gray-100 rounded-md w-24 sm:w-32 h-28 sm:h-36  text-2xl mb-1 shadow-md ${
                    isMine ? 'hover:bg-gray-200 hover:brightness-95' : ''
                  }`}
                  onClick={() => onClickAdd(v)}
                  disabled={!isMine}
                >
                  {yearlyTopBook ? (
                    <img
                      src={yearlyTopBook.book.image}
                      alt=""
                      width={128}
                      height={186}
                    />
                  ) : (
                    <>
                      {isMine ? (
                        <span className="font-bold">+</span>
                      ) : (
                        <span className="font-bold text-gray-500 text-sm sm:text-base">
                          未設定
                        </span>
                      )}
                    </>
                  )}
                </button>
                <div className="">{v}位</div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
