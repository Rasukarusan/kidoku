import dayjs from 'dayjs'
import Linkify from 'linkify-react'
import { Fragment, useState } from 'react'
import { Book } from '@/types/book'
import { useSession } from 'next-auth/react'
import { BookInputField } from '@/components/input/BookInputField'
import { BookSelectBox } from '@/components/input/BookSelectBox'
import { BookDatePicker } from '@/components/input/BookDatePicker'
import { AiFillLock } from 'react-icons/ai'
import { CheckoutModal } from '@/components/form/CheckoutModal'
import { MdExpandMore } from 'react-icons/md'
import { mask } from '@/utils/string'
import { Loading } from '@/components/icon/Loading'
import { Label } from '@/components/input/Label'

interface Props {
  book: Book
  onClick: () => void
}

export const BookDetailRead: React.FC<Props> = ({ book, onClick }) => {
  const { data: session } = useSession()
  const isMine = session?.user?.id === book.userId
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const returnUrl = () => {
    const url = new URL(window.location.href)
    const path = url.pathname
    return process.env.NEXT_PUBLIC_HOST + path + `?book=${book.id}`
  }

  const [scale, setScale] = useState(1)
  const [memoAreaHeight, setMemoAreaHeight] = useState(200)
  const [small, setSmall] = useState(false)
  const [readmoreBlur, setReadmoreBlur] = useState(true)

  const handleScroll = (event) => {
    const scrollTop = event.target.scrollTop
    const newScale = Math.max(0.5, 1 - scrollTop / 500)
    const newHeight = small
      ? window.innerHeight * 0.8 - 100
      : Math.min(800, 200 + scrollTop / 2)
    setScale(newScale)
    setMemoAreaHeight(newHeight)
    setReadmoreBlur(scrollTop === 0)
    if (scale <= 0.7) {
      setSmall(true)
    }
  }

  return (
    <div className="flex h-full min-w-full flex-col justify-between rounded-md">
      <div className="p-4">
        {small ? (
          <div className="mb-2 flex items-center">
            <img
              className="mr-4 max-h-[40px] drop-shadow-lg"
              src={book.image}
              alt={book.title}
              loading="lazy"
            />
            <div className="font-bold text-gray-500">{book.title}</div>
          </div>
        ) : (
          <div
            className="flex items-center"
            style={{ transform: `scale(${scale})` }}
          >
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
            <div className="mb-2 mr-2 w-2/3">
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
        )}
        {!small && (
          <div className="mb-1 flex items-center">
            <Label text="メモ" />
            {!book.is_public_memo && <AiFillLock className="mr-1 w-[15px]" />}
            {!book.is_public_memo && isMine && (
              <div className="text-[10px] text-gray-400">
                非公開のメモは他のユーザーには表示されません
              </div>
            )}
          </div>
        )}
        {small && (
          <button
            className="w-full text-center"
            onClick={() => {
              setSmall(false)
              setMemoAreaHeight(200)
              setScale(1)
            }}
          >
            <MdExpandMore className="mx-auto" />
          </button>
        )}
        {(isMine || book.is_public_memo) && (
          <div className="relative mb-1 block">
            <div
              className={`${
                readmoreBlur ? 'readmore-blur' : ''
              } no-scrollbar w-full resize-none overflow-auto border-b bg-white px-1 py-1 text-sm sm:text-base`}
              onScroll={handleScroll}
              style={{ height: `${memoAreaHeight}px` }}
            >
              <Memo memo={mask(book.memo)} />
            </div>
          </div>
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
                  <>
                    <CheckoutModal
                      open={open}
                      onClose={() => setOpen(false)}
                      returnUrl={returnUrl()}
                      purchaseText="￥50でコメントを開放する"
                    />
                    <button
                      className="w-full rounded-md bg-blue-600 py-1 text-center font-bold text-white blur-none"
                      onClick={() => setOpen(true)}
                    >
                      開放する
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {isMine && (
        <div className="border-1 w-full border-t text-center">
          <button
            className="flex h-12 w-full items-center justify-center rounded-md bg-blue-600 px-4 py-1 font-bold text-white hover:bg-blue-700 disabled:bg-blue-800"
            onClick={() => {
              setLoading(true)
              onClick()
            }}
            disabled={loading}
          >
            {loading && (
              <Loading className="mr-2 h-[18px] w-[18px] border-[3px] border-white" />
            )}
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
    <Linkify
      as="div"
      options={{ className: 'text-blue-500', target: '_blank' }}
    >
      {texts}
    </Linkify>
  )
}
