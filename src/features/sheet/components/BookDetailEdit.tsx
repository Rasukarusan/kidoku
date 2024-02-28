import { Fragment, useEffect, useState } from 'react'
import { Book } from '@/types/book'
import { ToggleButton } from '@/components/button/ToggleButton'
import { useSession } from 'next-auth/react'
import { Loading } from '@/components/icon/Loading'
import { ImagePicker } from '@/components/button/ImagePicker'
import { BookInputField } from '@/components/input/BookInputField'
import { BookSelectBox } from '@/components/input/BookSelectBox'
import { BookDatePicker } from '@/components/input/BookDatePicker'
import dayjs from 'dayjs'
import useSWR from 'swr'
import { fetcher } from '@/libs/swr'
import { BookCreatableSelectBox } from '@/components/input/BookCreatableSelectBox'

interface Props {
  currentBook: Book // 変更前の本
  book: Book
  onClick: () => void
  onDelete: () => void
  setBook: (book: Book) => void
  loading: boolean
}

export const BookDetailEdit: React.FC<Props> = ({
  currentBook,
  book,
  onClick,
  onDelete,
  setBook,
  loading,
}) => {
  const { data: session } = useSession()
  const isMine = session?.user?.id === book.userId
  const [diff, setDiff] = useState({
    title: false,
    author: false,
    category: false,
    impression: false,
    finished: false,
    memo: false,
  })
  // カテゴリ一覧
  const { data } = useSWR(`/api/books/category`, fetcher)
  const options =
    data && data.result
      ? data.categories.map((category) => {
          return { value: category, label: category }
        })
      : []

  // どこが変更されたかを取得
  useEffect(() => {
    setDiff({
      title: book.title !== currentBook.title,
      author: book.author !== currentBook.author,
      category: book.category !== currentBook.category,
      impression: book.impression !== currentBook.impression,
      finished: book.finished !== currentBook.finished,
      memo: book.memo !== currentBook.memo,
    })
  }, [book])
  return (
    <>
      <div className="overflow-y-hidden p-4">
        <div className="flex items-center">
          <ImagePicker
            img={book.image}
            onImageLoad={(image) => setBook({ ...book, image })}
          />
          <div className="mr-2 w-2/3">
            <BookInputField
              value={book?.title}
              onChange={(e) => setBook({ ...book, title: e.target.value })}
              label="タイトル"
              tabIndex={1}
              isChanged={diff.title}
            />
            <BookInputField
              value={book?.author}
              onChange={(e) => setBook({ ...book, author: e.target.value })}
              label="著者"
              tabIndex={2}
              isChanged={diff.author}
            />
            <BookCreatableSelectBox
              label="カテゴリ"
              defaultValue={{ value: book?.category, label: book?.category }}
              options={options}
              tabIndex={3}
              isChanged={diff.category}
              onChange={(newValue: { value: string; label: string }) => {
                setBook({ ...book, category: newValue?.value ?? '-' })
              }}
            />
            <div className="flex items-center">
              <BookSelectBox
                value={book?.impression}
                onChange={(e) =>
                  setBook({ ...book, impression: e.target.value })
                }
                label="感想"
                tabIndex={4}
                isChanged={diff.impression}
              />
              <BookDatePicker
                value={dayjs(book.finished).format('YYYY-MM-DD')}
                onChange={(e) =>
                  setBook({
                    ...book,
                    finished: dayjs(e.target.value).format('YYYY-MM-DD'),
                  })
                }
                label="読了日"
                tabIndex={5}
                isChanged={diff.finished}
              />
            </div>
          </div>
        </div>
        {isMine && (
          <>
            <BookInputField
              rows={8}
              value={book?.memo}
              onChange={(e) => setBook({ ...book, memo: e.target.value })}
              label="メモ"
              tabIndex={6}
              isChanged={diff.memo}
            />
            <div className="flex items-end justify-between">
              <div>
                <ToggleButton
                  label="メモを公開する"
                  checked={book.is_public_memo}
                  onChange={() => {
                    setBook({
                      ...book,
                      is_public_memo: !book.is_public_memo,
                    })
                  }}
                  disabled={false}
                />
                {process.env.NEXT_PUBLIC_FLAG_KIDOKU_1 === 'true' && (
                  <ToggleButton
                    label="課金によるメモの解放を許可する"
                    checked={book.is_purchasable}
                    onChange={() => {
                      setBook({ ...book, is_purchasable: !book.is_purchasable })
                    }}
                    disabled={book.is_public_memo}
                  />
                )}
              </div>
              <button
                className="pr-2 text-sm font-bold text-red-600"
                onClick={onDelete}
              >
                削除する
              </button>
            </div>
          </>
        )}
      </div>
      <div className="border-1 w-full border-t text-center">
        <button
          className="flex h-12 w-full items-center justify-center rounded-md bg-green-600 px-4 py-1 font-bold text-white hover:bg-green-700 disabled:bg-green-800"
          onClick={onClick}
          tabIndex={6}
          disabled={loading}
        >
          {loading && (
            <Loading className="mr-2 h-[18px] w-[18px] border-[3px] border-white" />
          )}
          <span>保存する</span>
        </button>
      </div>
    </>
  )
}
