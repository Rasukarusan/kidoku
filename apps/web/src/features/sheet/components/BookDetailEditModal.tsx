import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Book } from '@/types/book'
import { ToggleButton } from '@/components/button/ToggleButton'
import { Loading } from '@/components/icon/Loading'
import { ImagePicker } from '@/components/button/ImagePicker'
import { BookInputField } from '@/components/input/BookInputField'
import { BookSelectBox } from '@/components/input/BookSelectBox'
import { BookDatePicker } from '@/components/input/BookDatePicker'
import dayjs from 'dayjs'
import { useQuery } from '@apollo/client'
import { BookCreatableSelectBox } from '@/components/input/BookCreatableSelectBox'
import { Tooltip } from 'react-tooltip'
import { Label } from '@/components/input/Label'
import { HintIcon } from '@/components/icon/HintIcon'
import { MaskingHint } from '@/components/label/MaskingHint'
import { SheetSelectBox } from '@/components/input/SheetSelectBox'
import { SuiPriceInput } from '@/components/input/SuiPriceInput'
import { getBookCategoriesQuery } from '@/features/books/api'
import { mySuiAddressQuery } from '@/features/user/api/queries'
import { MEDIA_OPTIONS } from '@/utils/media'

// SSRを無効にしてクライアントサイドのみでロード
const MarkdownEditor = dynamic(
  () =>
    import('@/components/input/MarkdownEditor').then(
      (mod) => mod.MarkdownEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <span className="text-gray-400">エディタを読み込み中...</span>
      </div>
    ),
  }
)

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
  const [diff, setDiff] = useState({
    title: false,
    author: false,
    category: false,
    impression: false,
    finished: false,
    memo: false,
  })
  // カテゴリ一覧（GraphQL）
  const { data: categoriesData } = useQuery<{ bookCategories: string[] }>(
    getBookCategoriesQuery
  )
  const options = categoriesData
    ? categoriesData.bookCategories.map((category) => ({
        value: category,
        label: category,
      }))
    : []

  // 課金機能が有効なときのみ、自分の Sui 受取アドレスの設定有無を取得する。
  // 未設定だと購入された SUI を受け取れないため、課金トグルを無効化する。
  const isPurchaseFeatureEnabled =
    process.env.NEXT_PUBLIC_FLAG_KIDOKU_1 === 'true'
  const { data: suiAddressData, loading: suiAddressLoading } = useQuery<{
    mySuiAddress: string | null
  }>(mySuiAddressQuery, { skip: !isPurchaseFeatureEnabled })
  const hasSuiAddress = !!suiAddressData?.mySuiAddress

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
      <SheetSelectBox
        value={book?.sheetId}
        onChange={(sheet) => {
          setBook({
            ...book,
            sheetId: sheet.id,
            sheet: sheet.name,
          })
        }}
        className="mb-4"
        tabIndex={6}
      />
      <div className="mb-4 text-left">
        <Label text="媒体" className="mb-1" />
        <select
          value={book?.media ?? ''}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          onChange={(e) => setBook({ ...book, media: e.target.value || null })}
        >
          <option value="">未設定</option>
          {MEDIA_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center">
            <Label text="メモ" className="mb-0 mr-2" />
            <MaskingHint />
          </div>
          <div className="text-xs text-gray-500">
            {book?.memo?.length || 0} 文字
          </div>
        </div>
        <MarkdownEditor
          value={book?.memo || ''}
          onChange={(memo) => setBook({ ...book, memo })}
          minHeight="200px"
          className={diff.memo ? 'ring-2 ring-yellow-400' : ''}
        />
      </div>
      <div className="mb-4">
        <div>
          <ToggleButton
            label="メモを公開する"
            checked={book.isPublicMemo}
            onChange={() => {
              setBook({
                ...book,
                isPublicMemo: !book.isPublicMemo,
              })
            }}
            disabled={false}
            className="mb-2"
          />
          {isPurchaseFeatureEnabled && (
            <>
              <div className="mb-2 flex items-center">
                <ToggleButton
                  label="課金によるメモの解放を許可する"
                  checked={book.isPurchasable}
                  onChange={() => {
                    setBook({
                      ...book,
                      isPurchasable: !book.isPurchasable,
                    })
                  }}
                  disabled={book.isPublicMemo || !hasSuiAddress}
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
              {!hasSuiAddress && !suiAddressLoading && !book.isPublicMemo && (
                <p className="mb-2 text-xs text-gray-500">
                  課金を有効にするには Sui 受取アドレスの設定が必要です。
                  <Link
                    href="/settings/profile"
                    className="ml-1 font-semibold text-blue-600 underline hover:text-blue-700"
                  >
                    設定ページで登録する
                  </Link>
                </p>
              )}
              {book.isPurchasable && !book.isPublicMemo && (
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">
                    価格
                  </span>
                  <SuiPriceInput
                    key={book.id}
                    valueMist={book.price}
                    onChange={(price) => setBook({ ...book, price })}
                  />
                </div>
              )}
            </>
          )}
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
      <div className="mt-6 border-t border-gray-200 pt-4 text-center">
        <button
          className="text-xs text-gray-400 hover:text-red-500"
          onClick={onDelete}
        >
          この書籍を削除する
        </button>
      </div>
    </div>
  )
}
