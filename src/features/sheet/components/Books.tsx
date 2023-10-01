import { Fragment, useState } from 'react'
import SmsIcon from '@mui/icons-material/Sms'
import { Grid } from '@mui/material'
import { Record } from '../types'
import { HoverBook } from './HoverBook'
import { BookDetailDialog } from './BookDetailDialog'
import { useSession } from 'next-auth/react'

interface Props {
  books: Record[]
}
export const Books: React.FC<Props> = ({ books }) => {
  const initialHovers = Array(books.length).fill(false)
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [selectBook, setSelectBook] = useState<Record>(null)
  const [hovers, setHovers] = useState(initialHovers)

  const onClickImage = (book: Record) => {
    setSelectBook(book)
    setOpen(true)
    setHovers(initialHovers)
  }

  const onMouseEnter = (i: number) => {
    const newHovers = [...initialHovers]
    newHovers[i] = true
    setHovers(newHovers)
  }

  const onMouseLeave = (i: number) => {
    // hoverするとズーム用のコンポーネントが表示され、そちらにMouseEnterするためMouseLeaveしてしまう
    // そうなるとEnterとLeaveが無限ループしてしまうため、Leaveする際に現在のhover[i]=trueになっているインデックスと、
    // Leaveする際のインデックスが同じの場合はLeaveしないようにreturnするようにしている。
    const current = hovers.findIndex((v) => v)
    if (current === i) return
    const newHovers = [...initialHovers]
    newHovers[i] = false
    setHovers(newHovers)
  }

  return (
    <>
      <Grid container rowSpacing={1} columnSpacing={{ xs: 2, sm: 2, md: 3 }}>
        {books.map((book, i) => {
          return (
            <Grid key={book.title + i} item xs={4} sm={3} md={2}>
              <div className="relative bg-white px-2 py-4 sm:px-0 sm:py-2">
                <img
                  className="hover:cursor-pointer drop-shadow-lg"
                  src={book.image === '-' ? '/no-image.png' : book.image}
                  width={128}
                  height={186}
                  onClick={() => onClickImage(book)}
                  onMouseEnter={() => onMouseEnter(i)}
                  onMouseLeave={() => onMouseLeave(i)}
                  loading="lazy"
                />
                {((session && session.user.id === book.userId) ||
                  book.is_public_memo) &&
                  book?.memo !== '[期待]\n\n[感想]' &&
                  book?.memo !== '' && (
                    <p className="absolute top-[-5px] sm:top-[-15px] right-[28px]">
                      <SmsIcon />
                    </p>
                  )}
                {hovers[i] && (
                  <HoverBook
                    book={book}
                    onMouseLeave={onMouseLeave}
                    onClick={onClickImage}
                  />
                )}
              </div>
            </Grid>
          )
        })}
      </Grid>
      <BookDetailDialog
        open={open}
        book={selectBook}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
