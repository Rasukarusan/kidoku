import useSWR from 'swr'
import { fetcher } from '@/libs/swr'
import { Fragment, useEffect, useState } from 'react'
import { Book } from '@/types/book'
import { HoverBook } from './HoverBook'
import { BookDetailModal } from './BookDetailModal'
import { useSession } from 'next-auth/react'
import { NO_IMAGE } from '@/libs/constants'
import { AiFillLock } from 'react-icons/ai'

interface Props {
  bookId: string
  books: Book[]
  year: string
}
export const Books: React.FC<Props> = ({ bookId, books, year }) => {
  const initialHovers = Array(books.length).fill(false)
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [selectBook, setSelectBook] = useState<Book>(null)
  const [hovers, setHovers] = useState(initialHovers)
  const { mutate } = useSWR(`/api/books/${year}`, fetcher)

  // URLクエリで指定された本を開く
  useEffect(() => {
    if (bookId) {
      const book = books.filter((book) => book.id === Number(bookId))
      if (!book) return
      setSelectBook(book[0])
      setOpen(true)
    }
  }, [bookId])

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
                {!book.is_public_memo && (
                  <p className="absolute right-[-5px] top-[-3px] sm:right-[45px] sm:top-[-10px]">
                    <AiFillLock size={25} />
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
      <BookDetailModal
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
