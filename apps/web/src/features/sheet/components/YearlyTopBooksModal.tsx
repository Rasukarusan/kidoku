import { useMutation } from '@apollo/client'
import { Book } from '@/types/book'
import { useEffect, useState } from 'react'
import { useReward } from 'react-rewards'
import { SuccessAlert } from '@/components/label/SuccessAlert'
import { Loading } from '@/components/icon/Loading'
import { YearlyTopBook } from '@/types/book'
import { Modal } from '@/components/layout/Modal'
import {
  getYearlyTopBooksQuery,
  upsertYearlyTopBookMutation,
  deleteYearlyTopBookMutation,
} from '../api'

interface Props {
  books: Book[]
  year: string
  order: number
  open: boolean
  onClose: () => void
  yearlyTopBooks: YearlyTopBook[]
}
export const YearlyTopBooksModal: React.FC<Props> = ({
  yearlyTopBooks,
  open,
  onClose,
  year,
  order,
  books,
}) => {
  const [current, setCurrent] = useState<YearlyTopBook>(null)
  const [selectItem, setSelectItem] = useState<Book>(null)
  const [loading, setLoading] = useState(false)
  const { reward, isAnimating } = useReward('rewardId', 'balloons', {
    lifetime: 200,
    spread: 100,
  })
  const [message, setMessage] = useState('')
  const refetchQueries = [
    { query: getYearlyTopBooksQuery, variables: { input: { year } } },
  ]
  const [upsertYearlyTopBook] = useMutation(upsertYearlyTopBookMutation, {
    refetchQueries,
  })
  const [deleteYearlyTopBook] = useMutation(deleteYearlyTopBookMutation, {
    refetchQueries,
  })

  useEffect(() => {
    if (!yearlyTopBooks) return
    const current = yearlyTopBooks.filter((book) => book.order === order).pop()
    setCurrent(current)
    if (current) {
      setSelectItem(books.filter((book) => book.id === current.book.id).pop())
    } else {
      setSelectItem(null)
    }
  }, [order, year])

  const onClickSet = async () => {
    setLoading(true)
    if (selectItem) {
      // 新規で設定
      await upsertYearlyTopBook({
        variables: { input: { bookId: selectItem.id, year, order } },
      })
      setMessage(`『${selectItem.title}』を${order}位に設定しました`)
    } else {
      // 現在の設定を削除
      await deleteYearlyTopBook({
        variables: { input: { year, order } },
      })
      setMessage(`『${order}位の設定を削除しました`)
    }
    reward()
    setLoading(false)
  }

  return (
    <Modal open={open} onClose={onClose} className="h-[85vh] sm:w-2/3">
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <h2 className="mb-3 shrink-0 text-center text-2xl">
          {year}年ベスト<span className="font-bold">{order}位</span>を設定
        </h2>
        {selectItem && (
          <div className="mb-3 flex shrink-0 items-center gap-3 rounded-lg bg-blue-50 px-3 py-2">
            <img
              className="h-[56px] w-[40px] shrink-0 rounded object-cover shadow-sm"
              src={selectItem.image}
              alt={selectItem.title}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-gray-800">
                {selectItem.title}
              </div>
              <div className="truncate text-xs text-gray-500">
                {selectItem.author}
              </div>
            </div>
            <button
              className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-blue-100 hover:text-gray-600"
              onClick={() => setSelectItem(null)}
              aria-label="選択解除"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2 pb-4 sm:grid-cols-4 sm:gap-3">
            {books.map((book) => {
              const isSelected = selectItem?.id === book.id
              return (
                <button
                  className={`relative flex flex-col items-center rounded-lg p-1.5 transition-all sm:p-2 ${
                    isSelected
                      ? 'bg-blue-50 ring-2 ring-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                  key={book.id}
                  onClick={() => setSelectItem(isSelected ? null : book)}
                >
                  {isSelected && (
                    <div className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 sm:h-6 sm:w-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 text-white sm:h-4 sm:w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                  <img
                    className="mb-1 h-[100px] w-[70px] rounded object-cover shadow-sm sm:h-[130px] sm:w-[90px]"
                    src={book.image}
                    alt={book.title}
                    loading="lazy"
                  />
                  <div className="line-clamp-2 w-full text-center text-xs leading-tight text-gray-700">
                    {book.title}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <div className="flex h-[50px] w-full shrink-0 items-center justify-center text-center">
        {isAnimating && message && (
          <div className="absolute bottom-32 left-1/2 z-20 -translate-x-1/2 transform sm:bottom-28">
            <SuccessAlert
              open={true}
              text={message}
              onClose={() => setSelectItem(null)}
            />
          </div>
        )}
        <button
          className="z-10 flex h-full w-full items-center justify-center rounded-b-md bg-blue-600 font-bold text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:font-medium"
          onClick={onClickSet}
          disabled={!selectItem && !current}
        >
          {loading && (
            <Loading className="mr-2 h-[18px] w-[18px] border-[3px] border-white" />
          )}
          <span id="rewardId">設定する</span>
        </button>
      </div>
    </Modal>
  )
}
