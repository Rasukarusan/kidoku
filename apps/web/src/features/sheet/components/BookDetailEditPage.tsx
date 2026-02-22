import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Book } from '@/types/book'
import { ToggleButton } from '@/components/button/ToggleButton'
import { Loading } from '@/components/icon/Loading'
import { ImagePicker } from '@/components/button/ImagePicker'
import { BookSelectBox } from '@/components/input/BookSelectBox'
import { BookDatePicker } from '@/components/input/BookDatePicker'
import dayjs from 'dayjs'
import { useQuery } from '@apollo/client'
import { BookCreatableSelectBox } from '@/components/input/BookCreatableSelectBox'
import { Tooltip } from 'react-tooltip'
import { HintIcon } from '@/components/icon/HintIcon'
import { MaskingHint } from '@/components/label/MaskingHint'
import { useReward } from 'react-rewards'
import {
  getBookDraft,
  saveBookDraft,
  removeBookDraft,
  cleanupOldDrafts,
} from '@/utils/localStorage'
import { SheetSelectBox } from '@/components/input/SheetSelectBox'
import { getBookCategoriesQuery } from '@/features/books/api'

// SSRを無効にしてクライアントサイドのみでロード
const MarkdownEditor = dynamic(
  () =>
    import('@/components/input/MarkdownEditor').then(
      (mod) => mod.MarkdownEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <span className="text-gray-400">エディタを読み込み中...</span>
      </div>
    ),
  }
)

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
  const [hasDraft, setHasDraft] = useState(false)
  const { reward } = useReward('saveRewardId', 'balloons', {
    lifetime: 200,
    spread: 100,
  })

  // 初回マウント時に古い下書きをクリーンアップ
  useEffect(() => {
    cleanupOldDrafts()
  }, [])

  // ローカルストレージから下書きを復元
  useEffect(() => {
    if (!initialBook.id) return

    const draft = getBookDraft(String(initialBook.id))
    if (draft) {
      setBook((prev) => ({
        ...prev,
        memo: draft.memo ?? prev.memo,
        impression: draft.impression ?? prev.impression,
        category: draft.category ?? prev.category,
        finished: draft.finished ?? prev.finished,
        title: draft.title ?? prev.title,
        author: draft.author ?? prev.author,
        isPublicMemo: draft.isPublicMemo ?? prev.isPublicMemo,
      }))
      setHasDraft(true)
    }
  }, [initialBook.id])

  // 書籍データが変更されたらローカルストレージに自動保存
  useEffect(() => {
    if (!book.id) return

    const timeoutId = setTimeout(() => {
      saveBookDraft(String(book.id), {
        memo: book.memo,
        impression: book.impression,
        category: book.category,
        finished: book.finished,
        title: book.title,
        author: book.author,
        isPublicMemo: book.isPublicMemo,
      })
    }, 500) // 500msのデバウンス

    return () => clearTimeout(timeoutId)
  }, [
    book.id,
    book.memo,
    book.impression,
    book.category,
    book.finished,
    book.title,
    book.author,
    book.isPublicMemo,
  ])

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
        // 保存成功時にローカルストレージの下書きを削除
        if (book.id) {
          removeBookDraft(String(book.id))
        }
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
        body: JSON.stringify({
          id: book.id,
        }),
      })

      if (response.ok) {
        // 削除成功時にローカルストレージの下書きも削除
        if (book.id) {
          removeBookDraft(String(book.id))
        }
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
        {hasDraft && (
          <div className="mx-4 mt-4 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
            💾 下書きが復元されました
          </div>
        )}
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
              <div className="text-center">
                <label className="mb-1 block text-xs font-semibold text-gray-500">
                  シート
                </label>
                <SheetSelectBox
                  value={book?.sheetId}
                  onChange={(sheet) => {
                    setBook({
                      ...book,
                      sheetId: sheet.id,
                      sheet: sheet.name,
                    })
                  }}
                  label=""
                  tabIndex={6}
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
                  checked={book?.isPublicMemo || false}
                  onChange={() =>
                    setBook({
                      ...book,
                      isPublicMemo: !(book.isPublicMemo || false),
                    })
                  }
                />
                <HintIcon className="ml-2" data-tooltip-id="public-memo-hint" />
                <Tooltip id="public-memo-hint" className="!w-[300px]">
                  メモを公開すると、他のユーザーがあなたの感想やメモを閲覧できるようになります。非公開の場合は、あなただけが閲覧できます。
                </Tooltip>
              </div>
            </div>

            <MarkdownEditor
              value={book?.memo || ''}
              onChange={(memo) => setBook({ ...book, memo })}
              minHeight="300px"
            />
          </div>
        </div>

        <div className="mx-4 mt-8 border-t border-gray-200 pb-4 pt-4 text-center">
          <button
            onClick={handleDelete}
            className="text-xs text-gray-400 hover:text-red-500 disabled:opacity-50"
            disabled={loading}
          >
            この書籍を削除する
          </button>
        </div>
      </div>
    </div>
  )
}
