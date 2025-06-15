import useSWR from 'swr'
import { fetcher } from '@/libs/swr'
import { Fragment, useEffect, useState } from 'react'
import { Book } from '@/types/book'
import { HoverBook } from './HoverBook'
import { BookDetailSidebar } from './BookDetailSidebar'
import { NO_IMAGE } from '@/libs/constants'
import { AiFillLock } from 'react-icons/ai'
import { useRouter } from 'next/router'

interface Props {
  bookId: string
  books: Book[]
  year: string
}
export const Books: React.FC<Props> = ({ bookId, books, year }) => {
  const initialHovers = Array(books.length).fill(false)
  const router = useRouter()
  const [hovers, setHovers] = useState(initialHovers)
  const { mutate } = useSWR(`/api/books/${year}`, fetcher)

  // サイドバー用の状態管理
  const [openSidebar, setOpenSidebar] = useState(false)
  const [sidebarBook, setSidebarBook] = useState<Book | null>(null)

  // URLクエリで指定された本を開く
  useEffect(() => {
    if (bookId) {
      const book = books.filter((book) => book.id === Number(bookId))
      if (!book) return
      // デフォルトでサイドバー表示
      setSidebarBook(book[0])
      setOpenSidebar(true)
    }
  }, [bookId])

  const onClickImage = (book: Book, event?: React.MouseEvent) => {
    // Ctrl/Cmd + クリックでフルページ表示（新しいタブで開く）
    if (event && (event.ctrlKey || event.metaKey)) {
      router.push(`/books/${book.id}`)
    } else {
      // 通常クリックでサイドバー表示
      setSidebarBook(book)
      setOpenSidebar(true)
    }
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
                  onClick={(e) => onClickImage(book, e)}
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
                    onClick={(book, e) => onClickImage(book, e)}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 操作説明 */}
      <div className="mt-4 text-center text-xs text-gray-500 sm:text-sm">
        <p>クリック: サイドバー表示 | Ctrl/Cmd + クリック: フルページ表示</p>
      </div>

      <BookDetailSidebar
        open={openSidebar}
        book={sidebarBook}
        onClose={() => {
          mutate()
          setOpenSidebar(false)
          setSidebarBook(null)
        }}
        onExpandToFullPage={() => {
          if (sidebarBook) {
            router.push(`/books/${sidebarBook.id}`)
            setOpenSidebar(false)
          }
        }}
      />
    </>
  )
}
