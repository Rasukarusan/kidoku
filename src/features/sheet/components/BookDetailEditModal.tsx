import { useEffect, useState } from 'react'
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
import { Tooltip } from 'react-tooltip'
import { Label } from '@/components/input/Label'
import { HintIcon } from '@/components/icon/HintIcon'

interface Props {
  currentBook: Book // 変更前の本
  book: Book
  onClick: () => void
  onDelete: () => void
  setBook: (book: Book) => void
  loading: boolean
}

export const BookDetailEditModal: React.FC<Props> = ({
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
    <div className="overflow-y-hidden p-4">
      <div className="mb-4">
        <div className="flex justify-center">
          <ImagePicker
            img={book.image}
            onImageLoad={(image) => setBook({ ...book, image })}
          />
        </div>
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
      </div>
      <div className="mb-4 flex items-center justify-between text-left">
        <div className="max-w-[140px] sm:max-w-[200px]">
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
        </div>
        <BookSelectBox
          value={book?.impression}
          onChange={(e) => setBook({ ...book, impression: e.target.value })}
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
      <div className="mb-4">
        <div className="mb-2 flex items-center">
          <Label text="メモ" className="mb-0 mr-2" />
          <div data-tooltip-id="toggle-memo-tooltip">
            <HintIcon />
          </div>
          <Tooltip id="toggle-memo-tooltip" className="!w-[300px]">
            &quot;**&quot;で囲んだ文字はマスキングされ、他のユーザーには&quot;*****&quot;と表示されるようになります。例：「**マスク**さん」は「*****さん」と表示されます。
          </Tooltip>
        </div>
        <BookInputField
          rows={8}
          value={book?.memo}
          onChange={(e) => setBook({ ...book, memo: e.target.value })}
          tabIndex={6}
          isChanged={diff.memo}
        />
      </div>
      <div className="mb-4 items-start justify-between sm:flex">
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
            className="mb-2"
          />
          {process.env.NEXT_PUBLIC_FLAG_KIDOKU_1 === 'true' && (
            <div className="mb-2 flex items-center">
              <ToggleButton
                label="課金によるメモの解放を許可する"
                checked={book.is_purchasable}
                onChange={() => {
                  setBook({
                    ...book,
                    is_purchasable: !book.is_purchasable,
                  })
                }}
                disabled={book.is_public_memo}
                className="mr-1"
              />
              <div data-tooltip-id="toggle-purchase-tooltip">
                <HintIcon />
              </div>
              <Tooltip
                id="toggle-purchase-tooltip"
                className="!sm:w-[400px] !w-[350px] text-xs"
              >
                「ON」に設定することで、他のユーザーが課金することにより、
                非公開のメモを閲覧できます。公開されるのは課金したユーザーのみで、また、他の非公開メモは解放されません。
              </Tooltip>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <button
            className="pr-2 text-right text-xs font-bold text-red-600"
            onClick={onDelete}
          >
            削除する
          </button>
        </div>
      </div>
      <button
        className="mx-auto flex h-10 w-full items-center justify-center rounded-md bg-green-600 px-4 py-1 font-bold text-white hover:bg-green-700 disabled:bg-green-800"
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
  )
}
