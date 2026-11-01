import { useRef, useState } from 'react'
import { atom, useSetAtom, PrimitiveAtom } from 'jotai'
import { useApolloClient } from '@apollo/client'
import { removeBookDraft } from '@/utils/localStorage'

type DeleteNotice = { text: string; error: boolean } | null
export const bookDeleteNoticeAtom = atom(
  null as DeleteNotice
) as PrimitiveAtom<DeleteNotice>

export const useDeleteBook = () => {
  const client = useApolloClient()
  const notify = useSetAtom(bookDeleteNoticeAtom)
  const pending = useRef(false)
  const [deleting, setDeleting] = useState(false)

  const deleteBook = async (
    book: { id: number; title: string },
    onDeleted: () => void
  ) => {
    if (
      pending.current ||
      !confirm(`『${book.title}』を削除してもよろしいですか？`)
    )
      return
    pending.current = true
    setDeleting(true)
    notify(null)
    try {
      const response = await fetch('/api/books', {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
        body: JSON.stringify({ id: book.id }),
      })
      const result = await response.json()
      if (!response.ok || !result.result) throw new Error('Delete failed')
      removeBookDraft(String(book.id))
      // 詳細画面を閉じても通知はアプリ全体に残す。
      notify({ text: `『${book.title}』を削除しました`, error: false })
      void client.refetchQueries({ include: ['GetBooks'] }).catch(console.error)
      onDeleted()
    } catch {
      notify({
        text: '本の削除に失敗しました。再度お試しください。',
        error: true,
      })
    } finally {
      pending.current = false
      setDeleting(false)
    }
  }

  return { deleteBook, deleting }
}
