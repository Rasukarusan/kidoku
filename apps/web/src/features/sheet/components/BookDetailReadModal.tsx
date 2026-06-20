import dayjs from 'dayjs'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Book } from '@/types/book'
import { AiFillLock } from 'react-icons/ai'
import { useIsBookOwner } from '@/hooks/useIsBookOwner'
import { MdEdit } from 'react-icons/md'

// Sui決済モーダル（ウォレット連携を含むため動的読み込み）
const SuiCheckoutModal = dynamic(
  () =>
    import('@/components/form/SuiCheckoutModal').then(
      (mod) => mod.SuiCheckoutModal
    ),
  { ssr: false }
)
import { Loading } from '@/components/icon/Loading'
import { Tooltip } from 'react-tooltip'
import { Memo } from './Memo'
import { FaLink } from 'react-icons/fa'
import { FiShare2 } from 'react-icons/fi'
import { shareToSns } from '@/utils/socialShare'
import { useQuery } from '@apollo/client'
import { myLikedBookIdsQuery } from '@/features/social/api'
import { LikeButton } from '@/features/social/components/LikeButton'
import { useCachedSession } from '@/hooks/useCachedSession'
import {
  isSuiPaymentEnabled,
  mistToSui,
  resolveBookPriceMist,
} from '@/libs/sui/config'
import {
  purchasedBookMemoQuery,
  bookPaymentRecipientQuery,
} from '@/features/purchase/api'
import { SuiLogo } from '@/components/icon/SuiLogo'

interface Props {
  book: Book
  onClose: () => void
  onEdit?: () => void
}

export const BookDetailReadModal: React.FC<Props> = ({ book, onEdit }) => {
  const isMine = useIsBookOwner(book)
  const { status } = useCachedSession()
  const [suiOpen, setSuiOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // ログイン中はいいね済みの本IDを取得し、初期状態を反映する
  const { data: likedData } = useQuery(myLikedBookIdsQuery, {
    skip: status !== 'authenticated',
  })
  const likedBookIds: number[] = likedData?.myLikedBookIds ?? []

  // 購入済みの場合は解放されたメモ本文を取得する（非所有者・非公開・購入可能なときのみ）
  const canPurchase = !isMine && !book.isPublicMemo && book.isPurchasable
  const { data: memoData, refetch: refetchMemo } = useQuery(
    purchasedBookMemoQuery,
    {
      variables: { input: { bookId: Number(book.id) } },
      skip: status !== 'authenticated' || !canPurchase,
    }
  )
  const unlockedMemo: string | null | undefined = memoData?.purchasedBookMemo

  // 本の所有者が登録した Sui 受取アドレス（未登録ならボタンを出さない）
  const { data: recipientData } = useQuery(bookPaymentRecipientQuery, {
    variables: { input: { bookId: Number(book.id) } },
    skip: status !== 'authenticated' || !isSuiPaymentEnabled || !canPurchase,
  })
  const suiRecipient: string | null | undefined =
    recipientData?.bookPaymentRecipient

  // 本ごとの価格ラベル（未設定ならグローバル既定額）
  const priceLabel = `${mistToSui(resolveBookPriceMist(book.price))} SUI`

  const returnUrl = () => {
    return `${process.env.NEXT_PUBLIC_HOST || 'https://kidoku.net'}/books/${book.id}`
  }
  const shareUrl = returnUrl()

  return (
    <div className="flex h-full min-w-full flex-col justify-between rounded-md">
      <div className="flex-1">
        <div className="flex justify-end p-4">
          <div className="flex items-center space-x-2">
            {!isMine && (
              <div className="mr-1">
                <LikeButton
                  key={book.id}
                  bookId={book.id}
                  count={book.likeCount ?? 0}
                  liked={likedBookIds.includes(Number(book.id))}
                />
              </div>
            )}
            <button
              className="rounded-full bg-gray-200 p-2 hover:brightness-95"
              onClick={() => {
                navigator.clipboard.writeText(shareUrl)
              }}
              onMouseDown={(e) => e.preventDefault()}
              data-tooltip-id="share-button"
              data-tooltip-content="URLをコピー"
            >
              <FaLink size={18} />
            </button>
            <Tooltip id="share-button" />
            <button
              className="rounded-full bg-slate-800 p-2 text-white hover:bg-slate-700"
              onClick={() =>
                shareToSns(`『${book.title}』の感想📚 #kidoku`, shareUrl)
              }
              data-tooltip-id="book-sns-share"
              data-tooltip-content="SNSで共有"
            >
              <FiShare2 size={18} />
            </button>
            <Tooltip id="book-sns-share" />

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
              {!book.isPublicMemo && (
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

            {(isMine || book.isPublicMemo) && (
              <div className="rounded-lg bg-gray-50 p-4">
                <Memo memo={book.memo} />
              </div>
            )}

            {!isMine &&
              !book.isPublicMemo &&
              (unlockedMemo !== null && unlockedMemo !== undefined ? (
                <div className="rounded-lg bg-gray-50 p-4">
                  <Memo memo={unlockedMemo} />
                </div>
              ) : (
                <div className="rounded-lg bg-gray-100 p-8 text-center">
                  <AiFillLock
                    className="mx-auto mb-2 text-gray-400"
                    size={24}
                  />
                  <p className="text-gray-600">
                    このメモは非公開に設定されています
                  </p>
                  {process.env.NEXT_PUBLIC_FLAG_KIDOKU_1 === 'true' &&
                    book.isPurchasable && (
                      <div className="mt-4 flex flex-col items-center gap-2">
                        {isSuiPaymentEnabled && suiRecipient && (
                          <button
                            onClick={() => setSuiOpen(true)}
                            className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-[#4da2ff] via-[#3b82f6] to-[#0571e6] px-5 py-2.5 font-semibold text-white shadow-lg shadow-sky-500/30 ring-1 ring-inset ring-white/25 transition-all duration-200 hover:shadow-sky-400/50 hover:brightness-110 active:scale-[0.98]"
                          >
                            {/* ホバー時に走る光沢 */}
                            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
                              <SuiLogo size={13} className="text-white" />
                            </span>
                            <span>Suiで購入</span>
                            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold tabular-nums ring-1 ring-white/20">
                              {priceLabel}
                            </span>
                          </button>
                        )}
                      </div>
                    )}
                </div>
              ))}
          </div>
        </div>
      </div>

      {isSuiPaymentEnabled && suiRecipient && (
        <SuiCheckoutModal
          open={suiOpen}
          onClose={() => setSuiOpen(false)}
          bookId={Number(book.id)}
          recipientAddress={suiRecipient}
          priceMist={book.price}
          onPurchased={() => {
            refetchMemo()
            setSuiOpen(false)
          }}
        />
      )}
    </div>
  )
}
