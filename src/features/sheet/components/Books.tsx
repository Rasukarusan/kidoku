import useSWR from 'swr'
import { fetcher } from '@/libs/swr'
import { Fragment, useState } from 'react'
import { Book } from '@/types/book'
import { HoverBook } from './HoverBook'
import { BookDetailDialog } from './BookDetailDialog'
import { useSession } from 'next-auth/react'
import { NO_IMAGE } from '@/libs/constants'
import { FaCommentDots } from 'react-icons/fa'

interface Props {
  books: Book[]
  year: string
}
export const Books: React.FC<Props> = ({ books, year }) => {
  const initialHovers = Array(books.length).fill(false)
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [selectBook, setSelectBook] = useState<Book>(null)
  const [hovers, setHovers] = useState(initialHovers)
  const { mutate } = useSWR(`/api/books/${year}`, fetcher)

  const onClickImage = (book: Book) => {
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
      <div className="grid grid-cols-3 gap-x-2 gap-y-6 sm:grid-cols-6">
        {books.map((book, i) => {
          return (
            <div key={book.title + i} className="">
              <div className="relative bg-white px-2 py-4 sm:px-0 sm:py-2">
                <img
                  className="drop-shadow-lg hover:cursor-pointer"
                  src={book.image === '-' ? NO_IMAGE : book.image}
                  width={128}
                  height={186}
                  onClick={() => onClickImage(book)}
                  onMouseEnter={() => onMouseEnter(i)}
                  onMouseLeave={() => onMouseLeave(i)}
                  loading={i > 6 ? 'lazy' : 'eager'}
                />
                {((session && session.user.id === book.userId) ||
                  book.is_public_memo) &&
                  book?.memo !== '[期待]\n\n[感想]' &&
                  book?.memo !== '' && (
                    <p className="absolute top-[-3px] right-[-5px] sm:right-[40px] sm:top-[-10px]">
                      <FaCommentDots size={20} />
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
            </div>
          )
        })}
      </div>
      <BookDetailDialog
        open={open}
        book={selectBook}
        onClose={() => {
          mutate()
          setOpen(false)
        }}
      />
    </>
  )
}
