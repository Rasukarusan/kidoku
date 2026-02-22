import { useEffect, useState } from 'react'
import { Book } from '@/types/book'
import { HoverBook } from './HoverBook'
import { BookDetailSidebar } from './BookDetailSidebar'
import { NO_IMAGE } from '@/libs/constants'
import { AiFillLock } from 'react-icons/ai'
import { useRouter } from 'next/router'

interface Props {
  bookId: string
  books: Book[]
  onRefetch?: () => void
}
export const Books: React.FC<Props> = ({ bookId, books, onRefetch }) => {
  const initialHovers = Array(books.length).fill(false)
  const router = useRouter()
  const [hovers, setHovers] = useState(initialHovers)

  // サイドバー用の状態管理
  const [openSidebar, setOpenSidebar] = useState(false)
  const [sidebarBook, setSidebarBook] = useState<Book | null>(null)

  // URLクエリで指定された本を開く
  useEffect(() => {
    if (bookId) {
      const book = books.filter((book) => book.id === Number(bookId))
      if (!book) return
      setSidebarBook(book[0])
      setOpenSidebar(true)
      // 詳細ページをプリフェッチしてレスポンス速度を向上
      router.prefetch(`/books/${bookId}`)
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
      // 詳細ページをプリフェッチしてレスポンス速度を向上
      router.prefetch(`/books/${book.id}`)
    }
    setHovers(initialHovers)
  }

  const onMouseEnter = (i: number) => {
    const newHovers = [...initialHovers]
    newHovers[i] = true
    setHovers(newHovers)
  }

  const onMouseLeave = (i: number) => {
    const newHovers = [...initialHovers]
    newHovers[i] = false
    setHovers(newHovers)
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-x-2 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
        {books.map((book, i) => {
          return (
            <div key={book.title + i} className="">
              <div className="bg-white px-2 py-4 sm:px-0 sm:py-2">
                <div
                  className="relative inline-block"
                  onMouseEnter={() => onMouseEnter(i)}
                  onMouseLeave={() => onMouseLeave(i)}
                >
                  <img
                    className="drop-shadow-lg hover:cursor-pointer"
                    src={book.image === '-' ? NO_IMAGE : book.image}
                    width={128}
                    height={186}
                    onClick={(e) => onClickImage(book, e)}
                    loading={i > 6 ? 'lazy' : 'eager'}
                  />
                  {!book.isPublicMemo && (
                    <p className="absolute right-[-5px] top-[-3px]">
                      <AiFillLock size={25} />
                    </p>
                  )}
                  {hovers[i] && <HoverBook book={book} />}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <BookDetailSidebar
        open={openSidebar}
        book={sidebarBook}
        onClose={() => {
          onRefetch?.()
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
