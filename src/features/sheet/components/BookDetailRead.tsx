import dayjs from 'dayjs'
import Linkify from 'linkify-react'
import { Fragment, useState } from 'react'
import { Book } from '@/types/book'
import { useSession } from 'next-auth/react'
import { AiFillLock } from 'react-icons/ai'
import { CheckoutModal } from '@/components/form/CheckoutModal'
import { MdEdit, MdExpandMore } from 'react-icons/md'
import { mask } from '@/utils/string'
import { Loading } from '@/components/icon/Loading'
import { Tooltip } from 'react-tooltip'

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
      {small ? (
        <div className="mb-2 flex items-center px-4 pt-4">
          <img
            className="mr-4 max-h-[40px] drop-shadow-lg"
            src={book.image}
            alt={book.title}
            loading="lazy"
          />
          <div className="font-bold">{book.title}</div>
        </div>
      ) : (
        <div className="mb-4" style={{ transform: `scale(${scale})` }}>
          <div className="mb-4 rounded-md bg-slate-50 p-4">
            {isMine && (
              <button
                className="ml-auto mr-0 block rounded-full bg-gray-200 p-2 hover:brightness-95"
                onClick={() => {
                  setLoading(true)
                  onClick()
                }}
                disabled={loading}
              >
                {loading ? (
                  <Loading className="h-[18px] w-[18px] border-[3px] border-black" />
                ) : (
                  <MdEdit className="" size={18} />
                )}
              </button>
            )}
            <div className="mx-auto mb-4 w-[200px]">
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
            <div
              className="mx-auto mb-1 w-[300px] truncate text-center text-lg font-bold"
              data-tooltip-id="book-title"
            >
              {book.title}
            </div>
            <Tooltip id="book-title" className="max-w-[300px] sm:max-w-[400px]">
              {book.title}
            </Tooltip>
            <div className="mx-auto mb-4 w-[300px] truncate text-center text-xs text-gray-400">
              {book.author}
            </div>
          </div>
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="mb-1 text-xs font-bold text-gray-300">
                カテゴリ
              </div>
              <div className="text-center text-sm">{book.category}</div>
            </div>
            <div className="text-center">
              <div className="mb-1 text-xs font-bold text-gray-300">感想</div>
              <div className="text-center text-sm">{book.impression}</div>
            </div>
            <div className="text-center">
              <div className="mb-1 text-xs font-bold text-gray-300">読了日</div>
              <div className="text-center text-sm">
                {dayjs(book.finished).format('YYYY-MM-DD')}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="p-4">
        {!small && (
          <div className="mb-1 flex items-center">
            <div className="text-xs font-bold text-gray-300">メモ</div>
            {!book.is_public_memo && (
              <>
                <div data-tooltip-id="memo-lock">
                  <AiFillLock className="mx-1 w-[15px]" />
                </div>
                {isMine && (
                  <Tooltip id="memo-lock" className="">
                    非公開のメモは他のユーザーには表示されません
                  </Tooltip>
                )}
              </>
            )}
            {!book.is_public_memo && isMine && (
              <div className="text-[10px] text-gray-400"></div>
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
      </div>
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
