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
          <div className="mr-2 mb-2 w-2/3">
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
                key={book.id}
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
          {!book.is_public_memo && <AiFillLock className="mr-1 w-[15px]" />}
          {!book.is_public_memo && isMine && (
            <div className="text-[10px] text-gray-400">
              非公開のメモは他のユーザーには表示されません
            </div>
          )}
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
        {!isMine && !book.is_public_memo && (
          <div className="relative">
            <div className="absolute h-40 w-full bg-gray-200 blur-sm"></div>
            <div className="flex h-40 items-center justify-center rounded-md">
              <div>
                <div className="mb-2 flex items-center blur-none">
                  <div className="font-bold blur-none">非公開のメモです</div>
                </div>
                {process.env.NEXT_PUBLIC_FLAG_KIDOKU_1 === 'true' && (
                  <button className="w-full rounded-md bg-blue-600 py-1 text-center font-bold text-white blur-none">
                    開放する
                  </button>
                )}
              </div>
            </div>
          </div>
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
