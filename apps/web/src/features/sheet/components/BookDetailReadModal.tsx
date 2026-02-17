import dayjs from 'dayjs'
import { Fragment, useState } from 'react'
import { Book } from '@/types/book'
import { AiFillLock } from 'react-icons/ai'
import { useIsBookOwner } from '@/hooks/useIsBookOwner'
import { CheckoutModal } from '@/components/form/CheckoutModal'
import { MdEdit } from 'react-icons/md'
import { Loading } from '@/components/icon/Loading'
import { Tooltip } from 'react-tooltip'
import { Memo } from './Memo'
import { FaLink } from 'react-icons/fa'

interface Props {
  book: Book
  onClose: () => void
  onEdit?: () => void
}

export const BookDetailReadModal: React.FC<Props> = ({ book, onEdit }) => {
  const isMine = useIsBookOwner(book)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const returnUrl = () => {
    return `${process.env.NEXT_PUBLIC_HOST}/books/${book.id}`
  }

  return (
    <div className="flex h-full min-w-full flex-col justify-between rounded-md">
      <div className="flex-1">
        <div className="flex justify-end p-4">
          <div className="flex items-center space-x-2">
            <button
              className="rounded-full bg-gray-200 p-2 hover:brightness-95"
              onClick={() => {
                const url = returnUrl()
                navigator.clipboard.writeText(url)
              }}
              onMouseDown={(e) => e.preventDefault()}
              data-tooltip-id="share-button"
              data-tooltip-content="URLをコピー"
            >
              <FaLink size={18} />
            </button>
            <Tooltip id="share-button" />

            {isMine && onEdit && (
              <button
                className="block rounded-full bg-gray-200 p-2 hover:brightness-95"
                onClick={() => {
                  setLoading(true)
                  onEdit()
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
          </div>
        </div>

        <div className="px-4">
          <div className="mx-auto mb-4 w-[200px]">
            <a
              href={encodeURI(`https://www.amazon.co.jp/s?k=${book.title}`)}
              target="_blank"
              rel="noreferrer"
            >
              <img
                className="mx-auto my-0 max-h-[200px] drop-shadow-lg"
                src={book.image}
                alt={book.title}
                loading="lazy"
              />
            </a>
          </div>

          <div className="mb-6 text-center">
            <h1 className="mb-2 text-2xl font-bold">{book.title}</h1>
            <p className="mb-4 text-gray-600">{book.author}</p>

            <div className="flex justify-center space-x-8 text-sm text-gray-500">
              <div>
                <span className="font-semibold">カテゴリ:</span> {book.category}
              </div>
              <div>
                <span className="font-semibold">評価:</span> {book.impression}
              </div>
              <div>
                <span className="font-semibold">読了日:</span>{' '}
                {dayjs(book.finished).format('YYYY-MM-DD')}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4">
          <div className="mb-4">
            <div className="mb-2 flex items-center">
              <h2 className="text-lg font-semibold text-gray-800">メモ</h2>
              {!book.is_public_memo && (
                <>
                  <div data-tooltip-id="memo-lock">
                    <AiFillLock className="mx-2 w-[18px]" />
                  </div>
                  {isMine && (
                    <Tooltip id="memo-lock">
                      非公開のメモは他のユーザーには表示されません
                    </Tooltip>
                  )}
                </>
              )}
            </div>

            {(isMine || book.is_public_memo) && (
              <div className="rounded-lg bg-gray-50 p-4">
                <Memo memo={book.memo} />
              </div>
            )}

            {!isMine && !book.is_public_memo && (
              <div className="rounded-lg bg-gray-100 p-8 text-center">
                <AiFillLock className="mx-auto mb-2 text-gray-400" size={24} />
                <p className="text-gray-600">
                  このメモは非公開に設定されています
                </p>
                {process.env.NEXT_PUBLIC_FLAG_KIDOKU_1 === 'true' &&
                  book.is_purchasable && (
                    <button
                      className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                      onClick={() => setOpen(true)}
                    >
                      メモを見る（有料）
                    </button>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>

      <CheckoutModal
        open={open}
        onClose={() => setOpen(false)}
        returnUrl={returnUrl()}
        purchaseText="書籍を購入"
      />
    </div>
  )
}
