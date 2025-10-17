import { Book } from '@/types/book'
import { Modal } from '@/components/layout/Modal'
import { useEffect, useState } from 'react'
import { BookDetailReadModal } from './BookDetailReadModal'
import { BookDetailEditModal } from './BookDetailEditModal'
import { useReward } from 'react-rewards'
import { useSWRConfig } from 'swr'
import { useRouter } from 'next/router'
import {
  getBookDraft,
  saveBookDraft,
  removeBookDraft,
  cleanupOldDrafts,
} from '@/utils/localStorage'

interface Props {
  book?: Book
  open: boolean
  onClose: () => void
}

export const BookDetailModal: React.FC<Props> = ({ book, open, onClose }) => {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const [edit, setEdit] = useState(false)
  const [currentBook, setCurrentBook] = useState<Book>(book)
  const [newBook, setNewBook] = useState<Book>(book)
  const [loading, setLoading] = useState(false)
  const { reward } = useReward('rewardId', 'balloons', {
    lifetime: 200,
    spread: 100,
  })

  // 初回マウント時に古い下書きをクリーンアップ
  useEffect(() => {
    cleanupOldDrafts()
  }, [])

  useEffect(() => {
    setNewBook(book)
    setCurrentBook(book)
  }, [book])

  // 編集モード時にローカルストレージから下書きを復元
  useEffect(() => {
    if (!edit || !book?.id) return

    const draft = getBookDraft(String(book.id))
    if (draft) {
      setNewBook((prev) => ({
        ...prev,
        memo: draft.memo ?? prev.memo,
        impression: draft.impression ?? prev.impression,
        category: draft.category ?? prev.category,
        finished: draft.finished ?? prev.finished,
        title: draft.title ?? prev.title,
        author: draft.author ?? prev.author,
        is_public_memo: draft.is_public_memo ?? prev.is_public_memo,
      }))
    }
  }, [edit, book?.id])

  // 書籍データが変更されたらローカルストレージに自動保存（編集モード時のみ）
  useEffect(() => {
    if (!edit || !newBook?.id) return

    const timeoutId = setTimeout(() => {
      saveBookDraft(String(newBook.id), {
        memo: newBook.memo,
        impression: newBook.impression,
        category: newBook.category,
        finished: newBook.finished,
        title: newBook.title,
        author: newBook.author,
        is_public_memo: newBook.is_public_memo,
      })
    }, 500) // 500msのデバウンス

    return () => clearTimeout(timeoutId)
  }, [
    edit,
    newBook?.id,
    newBook?.memo,
    newBook?.impression,
    newBook?.category,
    newBook?.finished,
    newBook?.title,
    newBook?.author,
    newBook?.is_public_memo,
  ])

  const onClickEdit = async () => {
    // 編集する際はマスキングされていないメモを表示したいので、改めてデータを取得し直す。
    // ただし、すでに編集中の場合はそちらを表示したいので改めて取得はしない。
    const isDiff = Object.keys(book).some((key) => book[key] !== newBook[key])
    if (isDiff) {
      setEdit(true)
      return
    }
    const res = await fetch(`/api/book/${book?.id}`).then((res) => res.json())
    if (res.result) {
      setCurrentBook(res.book)
      setNewBook(res.book)
    }
    setEdit(true)
  }

  const onClickSave = async () => {
    setLoading(true)
    // 更新前と差分があるかをチェック
    const isDiff = Object.keys(book).some((key) => book[key] !== newBook[key])
    if (!isDiff) {
      setLoading(false)
      setEdit(false)
      return
    }
    const res = await fetch(`/api/books`, {
      method: 'PUT',
      body: JSON.stringify(newBook),
      headers: {
        Accept: 'application/json',
      },
    }).then((res) => res.json())
    setCurrentBook({ ...newBook, image: res.data?.image })

    // 保存成功時にローカルストレージの下書きを削除
    if (newBook?.id) {
      removeBookDraft(String(newBook.id))
    }

    reward()
    setLoading(false)
    setEdit(false)
    mutate(`/api/books/${router.query.year}`)
  }

  const onDelete = async () => {
    if (!confirm(`『${currentBook.title}』を削除してもよろしいですか？`)) return
    type Result = {
      result: boolean
    }
    const res: Result = await fetch(`/api/books`, {
      method: 'DELETE',
      body: JSON.stringify(currentBook),
      headers: {
        Accept: 'application/json',
      },
    }).then((res) => res.json())
    if (res.result) {
      // 削除成功時にローカルストレージの下書きも削除
      if (currentBook?.id) {
        removeBookDraft(String(currentBook.id))
      }
      onClose()
    }
  }

  if (!newBook) return null

  return (
    <Modal
      onClose={() => {
        if (!edit) {
          onClose()
          return
        }
        const isDiff = Object.keys(book).some(
          (key) => book[key] !== newBook[key]
        )
        if (!isDiff) {
          setEdit(false)
          return
        }
        if (
          confirm('変更内容が保存されていません。破棄してもよろしいですか？')
        ) {
          setEdit(false)
        }
      }}
      open={open}
      className="w-full sm:w-[480px]"
    >
      {edit ? (
        <BookDetailEditModal
          currentBook={currentBook}
          book={newBook}
          onClick={onClickSave}
          setBook={(editBook: Book) => {
            setNewBook({ ...editBook })
          }}
          loading={loading}
          onDelete={onDelete}
        />
      ) : (
        <BookDetailReadModal
          book={currentBook}
          onClose={() => {}}
          onEdit={onClickEdit}
        />
      )}
      <span id="rewardId" className="text-center"></span>
    </Modal>
  )
}
