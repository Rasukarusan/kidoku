import { Record } from '../types'
import { Dialog } from '@mui/material'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { BookDetailRead } from './BookDetailRead'
import { BookDetailEdit } from './BookDetailEdit'
import { useReward } from 'react-rewards'
import { useSWRConfig } from 'swr'
import { useRouter } from 'next/router'

interface Props {
  book?: Record
  open: boolean
  onClose: () => void
}

export const BookDetailDialog: React.FC<Props> = ({ book, open, onClose }) => {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const { data: session } = useSession()
  const [edit, setEdit] = useState(false)
  const [newBook, setNewBook] = useState<Record>(book)
  const [loading, setLoading] = useState(false)
  const { reward, isAnimating } = useReward('rewardId', 'balloons', {
    lifetime: 200,
    spread: 100,
  })

  useEffect(() => {
    setNewBook(book)
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
    })
    reward()
    setLoading(false)
    setEdit(false)
    mutate(`/api/books/${router.query.year}`)
  }

  if (!newBook) return null

  return (
    <Dialog
      onClose={() => {
        setEdit(false)
        onClose()
      }}
      open={open}
    >
      {edit ? (
        <BookDetailEdit
          book={newBook}
          onClick={onClickSave}
          setBook={(editBook: Record) => {
            setNewBook({ ...editBook })
          }}
          loading={loading}
        />
      ) : (
        <BookDetailRead book={book} onClick={onClickEdit} />
      )}
      <span id="rewardId" className="text-center"></span>
    </Dialog>
  )
}
