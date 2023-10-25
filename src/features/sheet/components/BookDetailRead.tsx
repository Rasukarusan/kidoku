import { Fragment } from 'react'
import { Book } from '@/types/book'
import { useSession } from 'next-auth/react'
import { BookInputField } from '@/components/input/BookInputField'
import dayjs from 'dayjs'
import { BookSelectBox } from '@/components/input/BookSelectBox'
import { BookDatePicker } from '@/components/input/BookDatePicker'
import { AiFillLock } from 'react-icons/ai'

interface Props {
  book: Book
  onClick: () => void
}

export const BookDetailRead: React.FC<Props> = ({ book, onClick }) => {
  const { data: session } = useSession()
  const isMine = session?.user?.id === book.userId
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="p-4">
        <div className="flex items-center">
          <div className="mr-4 w-1/3">
            <a
              href={encodeURI(`https://www.amazon.co.jp/s?k=${book.title}`)}
              target="_blank"
              rel="noreferrer"
            >
              <img
                className="mx-auto my-0 drop-shadow-lg"
                src={book.image}
                alt={book.title}
                loading="lazy"
              />
            </a>
          </div>
          <div className="mr-2 w-2/3">
            <BookInputField
              value={book.title}
              label="タイトル"
              tabIndex={1}
              readonly={true}
            />
            <BookInputField
              value={book.author}
              label="著者"
              tabIndex={2}
              readonly={true}
            />
            <BookInputField
              value={book.category}
              label="カテゴリ"
              tabIndex={3}
              readonly={true}
            />
            <div className="flex items-center">
              <BookSelectBox
                value={book.impression}
                label="感想"
                tabIndex={4}
                readonly={true}
              />
              <BookDatePicker
                value={dayjs(book.finished).format('YYYY-MM-DD')}
                label="読了日"
                tabIndex={5}
                readonly={true}
              />
            </div>
          </div>
        </div>
        <div className="mb-1 flex items-center">
          <div className="mr-1 text-xs text-gray-400">メモ</div>
          {!book.is_public_memo && <AiFillLock className="w-[15px]" />}
        </div>
        {(isMine || book.is_public_memo) && (
          <BookInputField
            rows={8}
            value={book.memo}
            label=""
            tabIndex={6}
            readonly={true}
          />
        )}
      </div>
      {isMine && (
        <div className="border-1 w-full border-t text-center">
          <button
            className="h-12 w-full bg-blue-600 px-4 py-1 font-bold text-white hover:bg-blue-700"
            onClick={onClick}
          >
            編集する
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * \nを<br>に変換したコンポーネント
 */
export const Memo = ({ memo }) => {
  if (!memo) return null
  const texts = memo.split(/(\n)/).map((item, index) => {
    return <Fragment key={index}>{item.match(/\n/) ? <br /> : item}</Fragment>
  })
  return (
    <div className="max-h-[290px] overflow-y-auto text-sm sm:px-2 sm:py-4 sm:text-base">
      {texts}
    </div>
  )
}
