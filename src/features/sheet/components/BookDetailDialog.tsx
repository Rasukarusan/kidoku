import { Book } from '@/types/book'
import { Modal } from '@/components/layout/Modal'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { BookDetailRead } from './BookDetailRead'
import { BookDetailEdit } from './BookDetailEdit'
import { useReward } from 'react-rewards'
import { useSWRConfig } from 'swr'
import { useRouter } from 'next/router'

interface Props {
  book?: Book
  open: boolean
  onClose: () => void
}

export const BookDetailDialog: React.FC<Props> = ({ book, open, onClose }) => {
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

  const onClickEdit = () => {
    setEdit(true)
  }

  const onClickSave = async () => {
    setLoading(true)
    // 更新前と差分があるかをチェック
    let isDiff = false
    Object.keys(book).forEach((key) => {
      if (book[key] !== newBook[key]) {
        isDiff = true
      }
    })
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
    setCurrentBook({ ...newBook, image: res.data.image })
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
        if (edit) {
          setEdit(false)
        } else {
          onClose()
        }
      }}
      open={open}
      className="sm:w-1/2"
    >
      {edit ? (
        <BookDetailEdit
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
        <BookDetailRead book={currentBook} onClick={onClickEdit} />
      )}
      <span id="rewardId" className="text-center"></span>
    </Modal>
  )
}
