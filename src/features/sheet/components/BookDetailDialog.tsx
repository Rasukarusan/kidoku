import { Record } from '../types'
import { Dialog } from '@mui/material'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { BookDetailRead } from './BookDetailRead'
import { BookDetailEdit } from './BookDetailEdit'

interface Props {
  book?: Record
  open: boolean
  onClose: () => void
}

export const BookDetailDialog: React.FC<Props> = ({ book, open, onClose }) => {
  const { data: session } = useSession()
  const [edit, setEdit] = useState(false)
  const [newBook, setNewBook] = useState<Record>(book)

  useEffect(() => {
    setNewBook(book)
  }, [book])

  const onClickEdit = () => {
    setEdit(true)
  }

  const onClickSave = async () => {
    setEdit(false)
    const res = await fetch(`/api/books`, {
      method: 'POST',
      body: JSON.stringify(newBook),
      headers: {
        Accept: 'application/json',
      },
    })
  }

  if (!newBook) return null

  return (
    <Dialog onClose={onClose} open={open}>
      {edit ? (
        <BookDetailEdit
          book={newBook}
          onClick={onClickSave}
          setBook={(editBook: Record) => {
            setNewBook({ ...editBook })
          }}
        />
      ) : (
        <BookDetailRead book={newBook} onClick={onClickEdit} />
      )}
    </Dialog>
  )
}
