import { useState } from 'react'
import { Book } from '@/types/book'
import { ToggleButton } from '@/components/button/ToggleButton'
import { Loading } from '@/components/icon/Loading'
import { ImagePicker } from '@/components/button/ImagePicker'
import { BookSelectBox } from '@/components/input/BookSelectBox'
import { BookDatePicker } from '@/components/input/BookDatePicker'
import dayjs from 'dayjs'
import useSWR from 'swr'
import { fetcher } from '@/libs/swr'
import { BookCreatableSelectBox } from '@/components/input/BookCreatableSelectBox'
import { Tooltip } from 'react-tooltip'
import { HintIcon } from '@/components/icon/HintIcon'
import { MaskingHint } from '@/components/label/MaskingHint'
import { useReward } from 'react-rewards'
import { CategoriesResponse } from '@/types/api'

interface Props {
  book: Book
  onClose: () => void
  onCancel: () => void
}


export const BookDetailEditPage: React.FC<Props> = ({
  book: initialBook,
  onClose,
  onCancel,
}) => {
  const [book, setBook] = useState<Book>(initialBook)
  const [loading, setLoading] = useState(false)
  const { reward } = useReward('saveRewardId', 'balloons', {
    lifetime: 200,
    spread: 100,
  })

  // カテゴリ一覧
  const { data } = useSWR<CategoriesResponse>(`/api/books/category`, fetcher)
  const options =
    data && data.result
      ? data.categories.map((category) => {
          return { value: category, label: category }
        })
      : []

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/books`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
        },
        body: JSON.stringify(book),
      })

      if (response.ok) {
        reward() // 保存成功時にアニメーション
        setTimeout(() => {
          onCancel() // 編集モードを終了して読み取りモードに戻る
        }, 500) // アニメーションが見えるように少し遅延
      }
    } catch (error) {
      console.error('Error saving book:', error)
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('この書籍を削除しますか？')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/books`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
        },
        body: JSON.stringify(book),
      })

      if (response.ok) {
        onClose()
      }
    } catch (error) {
      console.error('Error deleting book:', error)
    }
    setLoading(false)
  }

  return (
    <div className="flex h-full min-w-full flex-col justify-between rounded-md">
      <div className="flex-1">
        <div className="flex justify-end p-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={onCancel}
              className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 disabled:opacity-50"
              disabled={loading}
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="relative rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <Loading className="h-5 w-5 border-2 border-white" />
              ) : (
                '保存'
              )}
              <span
                id="saveRewardId"
                className="absolute left-1/2 top-0 -translate-x-1/2 transform"
              ></span>
            </button>
          </div>
        </div>

        <div className="px-4">
          <div className="mx-auto mb-4 w-[200px]">
            <ImagePicker
              img={book.image}
              onImageLoad={(image) => setBook({ ...book, image })}
            />
          </div>

          <div className="mb-6 text-center">
            <h1 className="mb-2">
              <input
                type="text"
                value={book?.title || ''}
                onChange={(e) => setBook({ ...book, title: e.target.value })}
                placeholder="タイトルを入力"
                className="w-full rounded border-none bg-transparent px-3 py-2 text-center text-2xl font-bold transition-colors hover:bg-gray-50 focus:border focus:border-blue-300 focus:bg-white focus:outline-none"
                tabIndex={1}
              />
            </h1>

            <p className="mb-4">
              <input
                type="text"
                value={book?.author || ''}
                onChange={(e) => setBook({ ...book, author: e.target.value })}
                placeholder="著者を入力"
                className="w-full rounded border-none bg-transparent px-3 py-2 text-center text-gray-600 transition-colors hover:bg-gray-50 focus:border focus:border-blue-300 focus:bg-white focus:outline-none"
                tabIndex={2}
              />
            </p>

            <div className="flex justify-center space-x-8 text-sm">
              <div className="text-center">
                <label className="mb-1 block text-xs font-semibold text-gray-500">
                  カテゴリ
                </label>
                <BookCreatableSelectBox
                  label=""
                  value={
                    book?.category
                      ? { value: book.category, label: book.category }
                      : null
                  }
                  options={options}
                  onChange={(category) =>
                    setBook({
                      ...book,
                      category:
                        typeof category === 'string'
                          ? category
                          : (category as { value: string } | null)?.value || '',
                    })
                  }
                  tabIndex={3}
                />
              </div>
              <div className="text-center">
                <label className="mb-1 block text-xs font-semibold text-gray-500">
                  評価
                </label>
                <BookSelectBox
                  label=""
                  value={book?.impression}
                  onChange={(e) =>
                    setBook({ ...book, impression: e.target.value })
                  }
                  tabIndex={4}
                />
              </div>
              <div className="text-center">
                <label className="mb-1 block text-xs font-semibold text-gray-500">
                  読了日
                </label>
                <BookDatePicker
                  label=""
                  value={
                    book?.finished
                      ? dayjs(book.finished).format('YYYY-MM-DD')
                      : ''
                  }
                  onChange={(e) =>
                    setBook({ ...book, finished: e.target.value })
                  }
                  tabIndex={5}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-4">
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-gray-800">メモ</h2>
                <div className="ml-2">
                  <MaskingHint />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <ToggleButton
                  label="公開する"
                  checked={book?.is_public_memo || false}
                  onChange={() =>
                    setBook({
                      ...book,
                      is_public_memo: !(book.is_public_memo || false),
                    })
                  }
                />
                <HintIcon className="ml-2" data-tooltip-id="public-memo-hint" />
                <Tooltip id="public-memo-hint" className="!w-[300px]">
                  メモを公開すると、他のユーザーがあなたの感想やメモを閲覧できるようになります。非公開の場合は、あなただけが閲覧できます。
                </Tooltip>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <textarea
                value={book?.memo || ''}
                onChange={(e) => {
                  setBook({ ...book, memo: e.target.value })
                  // 自動でテキストエリアの高さを調整
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                }}
                className="w-full resize-none border-none bg-transparent text-sm leading-relaxed focus:outline-none"
                placeholder="感想やメモを入力してください..."
                tabIndex={6}
                style={{
                  minHeight: '300px',
                  lineHeight: '1.6',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                }}
              />
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={handleDelete}
            className="rounded-md bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 disabled:opacity-50"
            disabled={loading}
          >
            削除
          </button>
        </div>
      </div>
    </div>
  )
}
