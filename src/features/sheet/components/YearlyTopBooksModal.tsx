import { Book } from '@/types/book'
import { useEffect, useState } from 'react'
import { useReward } from 'react-rewards'
import { truncate } from '@/utils/string'
import { SuccessAlert } from '@/components/label/SuccessAlert'
import { Loading } from '@/components/icon/Loading'
import { YearlyTopBook } from '@/types/book'
import { Modal } from '@/components/layout/Modal'

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

  useEffect(() => {
    if (!yearlyTopBooks) return
    const current = yearlyTopBooks.filter((book) => book.order === order).pop()
    setCurrent(current)
    if (current) {
      const b = books.filter((book) => book.id === current.book.id).pop()
      setSelectItem(books.filter((book) => book.id === current.book.id).pop())
    } else {
      setSelectItem(null)
    }
  }, [order, year])

  const onClickSet = async () => {
    setLoading(true)
    if (selectItem) {
      // 新規で設定
      const res = await fetch(`/api/yearly`, {
        method: 'POST',
        body: JSON.stringify({ bookId: selectItem.id, year, order }),
        headers: {
          Accept: 'application/json',
        },
      }).then((res) => res.json())
      setMessage(`『${selectItem.title}』を${order}位に設定しました`)
    } else {
      // 現在の設定を削除
      const current = yearlyTopBooks
        .filter((book) => book.order === order)
        .pop()
      const res = await fetch(`/api/yearly`, {
        method: 'DELETE',
        body: JSON.stringify({ bookId: current.book.id, year, order }),
        headers: {
          Accept: 'application/json',
        },
      }).then((res) => res.json())
      setMessage(`『${order}位の設定を削除しました`)
    }
    reward()
    setLoading(false)
  }

  return (
    <Modal open={open} onClose={onClose} className="h-3/4 sm:w-2/3">
      <div className="h-full p-4">
        <h2 className="mb-4 shrink-0 text-center text-2xl font-bold">
          {year}年ベスト<span className="underline">{order}位</span>を設定
        </h2>
        <div className="flex h-full w-full flex-wrap justify-center overflow-y-auto p-4 pb-12 text-gray-900">
          {books.map((book, i: number) => {
            return (
              <div
                className={`m-2 w-3/4 cursor-pointer rounded-md border border-gray-300 px-4 py-2 shadow hover:bg-gray-100 sm:w-[200px] ${
                  selectItem?.id === book.id
                    ? 'bg-pink-200 hover:bg-pink-200'
                    : 'bg-white'
                }`}
                key={book.id}
                onClick={() =>
                  setSelectItem(selectItem?.id === book.id ? null : book)
                }
              >
                <div className="mb-1 font-bold">{truncate(book.title, 15)}</div>
                <div className="mb-1 text-xs">{book.author}</div>
                <img
                  className="m-auto mb-1 h-[150px] object-contain"
                  src={book.image}
                  alt={book.title}
                  loading="lazy"
                />
                <div className="text-sm">{truncate(book.memo, 30)}</div>
              </div>
            )
          })}
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
