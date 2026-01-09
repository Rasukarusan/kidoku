import useSWR from 'swr'
import { fetcher } from '@/libs/swr'
import { useEffect, useState, useRef, useCallback } from 'react'
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
  // ホバーモードかクリックモードかを管理
  const [isHoverMode, setIsHoverMode] = useState(false)
  // サイドバー上にマウスがあるかどうか
  const [isMouseOnSidebar, setIsMouseOnSidebar] = useState(false)
  // ホバー用タイマー
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null)
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null)

  // タイマーのクリーンアップ
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  // URLクエリで指定された本を開く
  useEffect(() => {
    if (bookId) {
      const book = books.filter((book) => book.id === Number(bookId))
      if (!book) return
      // デフォルトでサイドバー表示（クリックモード）
      setSidebarBook(book[0])
      setOpenSidebar(true)
      setIsHoverMode(false)
    }
  }, [bookId])

  const onClickImage = (book: Book, event?: React.MouseEvent) => {
    // Ctrl/Cmd + クリックでフルページ表示（新しいタブで開く）
    if (event && (event.ctrlKey || event.metaKey)) {
      router.push(`/books/${book.id}`)
    } else {
      // 通常クリックでサイドバー表示（クリックモードに切り替え）
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      setSidebarBook(book)
      setOpenSidebar(true)
      setIsHoverMode(false)
    }
    setHovers(initialHovers)
  }

  // ホバーでサイドバーを開く
  const openSidebarOnHover = useCallback(
    (book: Book) => {
      // 既にサイドバーが開いている場合は何もしない
      if (openSidebar) return

      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)

      // 少し遅延してからサイドバーを開く（チラつき防止）
      hoverTimerRef.current = setTimeout(() => {
        setSidebarBook(book)
        setOpenSidebar(true)
        setIsHoverMode(true)
      }, 200)
    },
    [openSidebar]
  )

  // ホバーでサイドバーを閉じる
  const closeSidebarOnHoverEnd = useCallback(() => {
    // クリックモードの場合は閉じない
    if (!isHoverMode) return

    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)

    // 少し遅延してから閉じる（サイドバーへの移動を許容）
    closeTimerRef.current = setTimeout(() => {
      if (!isMouseOnSidebar) {
        setOpenSidebar(false)
        setSidebarBook(null)
        setIsHoverMode(false)
      }
    }, 300)
  }, [isHoverMode, isMouseOnSidebar])

  // サイドバーにマウスが入った時
  const handleSidebarMouseEnter = useCallback(() => {
    setIsMouseOnSidebar(true)
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
  }, [])

  // サイドバーからマウスが離れた時
  const handleSidebarMouseLeave = useCallback(() => {
    setIsMouseOnSidebar(false)
    if (isHoverMode) {
      closeTimerRef.current = setTimeout(() => {
        setOpenSidebar(false)
        setSidebarBook(null)
        setIsHoverMode(false)
      }, 300)
    }
  }, [isHoverMode])

  const onMouseEnter = (i: number, book: Book) => {
    const newHovers = [...initialHovers]
    newHovers[i] = true
    setHovers(newHovers)

    // ホバーでサイドバーを開く
    openSidebarOnHover(book)
  }

  const onMouseLeave = (i: number) => {
    const newHovers = [...initialHovers]
    newHovers[i] = false
    setHovers(newHovers)

    // ホバーモードの場合、サイドバーを閉じる
    closeSidebarOnHoverEnd()
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
                  onMouseEnter={() => onMouseEnter(i, book)}
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
                  {!book.is_public_memo && (
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
        isHoverMode={isHoverMode}
        onClose={() => {
          mutate()
          setOpenSidebar(false)
          setSidebarBook(null)
          setIsHoverMode(false)
        }}
        onExpandToFullPage={() => {
          if (sidebarBook) {
            router.push(`/books/${sidebarBook.id}`)
            setOpenSidebar(false)
            setIsHoverMode(false)
          }
        }}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      />
    </>
  )
}
