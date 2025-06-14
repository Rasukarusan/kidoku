import { Book } from '@/types/book'
import { Modal } from '@/components/layout/Modal'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { BookDetailReadModal } from './BookDetailReadModal'
import { BookDetailEditModal } from './BookDetailEditModal'
import { useReward } from 'react-rewards'
import { useSWRConfig } from 'swr'
import { useRouter } from 'next/router'

interface Props {
  book?: Book
  open: boolean
  onClose: () => void
}

export const BookDetailModal: React.FC<Props> = ({ book, open, onClose }) => {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const { data: session } = useSession()
  const [edit, setEdit] = useState(false)
  const [currentBook, setCurrentBook] = useState<Book>(book)
  const [newBook, setNewBook] = useState<Book>(book)
  const [loading, setLoading] = useState(false)
  const { reward, isAnimating } = useReward('rewardId', 'balloons', {
    lifetime: 200,
    spread: 100,
  })

  useEffect(() => {
    setNewBook(book)
    setCurrentBook(book)
  }, [book])

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
