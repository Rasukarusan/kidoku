import { Fragment } from 'react'
import { Book } from '@/types/book'
import { useSession } from 'next-auth/react'
import { BookInputField } from '@/components/input/BookInputField'
import dayjs from 'dayjs'
import { BookSelectBox } from '@/components/input/BookSelectBox'
import { BookDatePicker } from '@/components/input/BookDatePicker'

interface Props {
  book: Book
  onClick: () => void
}

export const BookDetailRead: React.FC<Props> = ({ book, onClick }) => {
  const { data: session } = useSession()
  const isMine = session?.user?.id === book.userId
  return (
    <div className="flex flex-col justify-between h-full">
      <div className="p-4">
        <div className="flex items-center">
          <div className="w-1/3 mr-4">
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
          <div className="w-2/3 mr-2">
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
        {(isMine || book.is_public_memo) && (
          <BookInputField
            rows={8}
            value={book.memo}
            label="メモ"
            tabIndex={6}
            readonly={true}
          />
        )}
      </div>
      {isMine && (
        <div className="border-t border-1 text-center w-full">
          <button
            className="bg-blue-600 hover:bg-blue-700 px-4 py-1 font-bold text-white h-12 w-full"
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
    <div className="max-h-[290px] sm:px-2 sm:py-4 overflow-y-auto text-sm sm:text-base">
      {texts}
    </div>
  )
}
