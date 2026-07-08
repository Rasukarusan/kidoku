import { useState, useEffect } from 'react'
import { Book } from '@/types/book'
import { BookDetailEditModal } from './BookDetailEditModal'
import { useReward } from 'react-rewards'
import {
  getBookDraft,
  saveBookDraft,
  removeBookDraft,
  cleanupOldDrafts,
} from '@/utils/localStorage'

interface Props {
  book: Book
  onClose: () => void
  onCancel: () => void
  onSaved: (book: Book) => void
}

export const BookDetailEditPage: React.FC<Props> = ({
  book: initialBook,
  onClose,
  onCancel,
  onSaved,
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
        isPurchasable: draft.isPurchasable ?? prev.isPurchasable,
        price: draft.price ?? prev.price,
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
        isPurchasable: book.isPurchasable,
        price: book.price,
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
    book.isPurchasable,
    book.price,
  ])

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
        // サーバー側で画像がVercel Blobにアップロードされた場合、最終的なURLが返る
        const result = await response.json().catch(() => null)
        const savedBook: Book =
          result?.image != null ? { ...book, image: result.image } : book

        // 保存成功時にローカルストレージの下書きを削除
        if (book.id) {
          removeBookDraft(String(book.id))
        }
        reward() // 保存成功時にアニメーション
        setTimeout(() => {
          // 編集内容を親に反映して読み取りモードに戻る。
          // ISRの再生成を待たずに保存済みデータを即座に表示するため、
          // 再取得ではなく手元の編集結果をそのまま渡す。
          onSaved(savedBook)
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
    <div className="mx-auto max-w-3xl rounded-md bg-white">
      {hasDraft && (
        <div className="mx-4 mt-4 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
          💾 下書きが復元されました
        </div>
      )}
      <div className="flex justify-end px-4 pt-4">
        <button
          onClick={onCancel}
          className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 disabled:opacity-50"
          disabled={loading}
        >
          キャンセル
        </button>
      </div>
      {/* 横スライド（サイドバー）と同じ編集フォームを再利用してレイアウトを統一する */}
      <BookDetailEditModal
        currentBook={initialBook}
        book={book}
        onClick={handleSave}
        setBook={(editBook: Book) => setBook({ ...editBook })}
        loading={loading}
        onDelete={handleDelete}
      />
      <span id="saveRewardId" className="flex justify-center"></span>
    </div>
  )
}
