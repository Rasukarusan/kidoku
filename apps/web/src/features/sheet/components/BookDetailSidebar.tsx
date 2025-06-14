import { Book } from '@/types/book'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { BookDetailReadModal } from './BookDetailReadModal'
import { BookDetailEditModal } from './BookDetailEditModal'
import { useReward } from 'react-rewards'
import { useSWRConfig } from 'swr'
import { useRouter } from 'next/router'
import { IoMdClose, IoMdExpand } from 'react-icons/io'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  book?: Book
  open: boolean
  onClose: () => void
  onExpandToFullPage: () => void
}

export const BookDetailSidebar: React.FC<Props> = ({
  book,
  open,
  onClose,
  onExpandToFullPage,
}) => {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const { data: session } = useSession()
  const [edit, setEdit] = useState(false)
  const [currentBook, setCurrentBook] = useState<Book>(book)
  const [newBook, setNewBook] = useState<Book>(book)
  const [loading, setLoading] = useState(false)
  const { reward, isAnimating } = useReward('sidebarRewardId', 'balloons', {
    lifetime: 200,
    spread: 100,
  })

  useEffect(() => {
    setNewBook(book)
    setCurrentBook(book)
  }, [book])

  const onClickEdit = async () => {
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

  const handleClose = () => {
    if (!edit) {
      onClose()
      return
    }
    const isDiff = Object.keys(book).some((key) => book[key] !== newBook[key])
    if (!isDiff) {
      setEdit(false)
      return
    }
    if (confirm('変更内容が保存されていません。破棄してもよろしいですか？')) {
      setEdit(false)
    }
  }

  if (!newBook) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* オーバーレイ */}
          <motion.div
            className="fixed inset-0 z-[999] bg-black bg-opacity-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* サイドバー */}
          <motion.div
            className="fixed right-0 top-0 z-[1000] flex h-full w-full bg-white shadow-2xl md:w-[480px] lg:w-[540px]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="flex h-full w-full flex-col">
              {/* ヘッダー */}
              <div className="flex items-center justify-between border-b border-gray-200 p-4">
                <h2 className="text-base font-semibold text-gray-800 sm:text-lg">
                  {edit ? '本の編集' : '本の詳細'}
                </h2>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={onExpandToFullPage}
                    className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 sm:block"
                    title="フルページで開く"
                  >
                    <IoMdExpand size={18} className="sm:h-5 sm:w-5" />
                  </button>
                  <button
                    onClick={handleClose}
                    className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  >
                    <IoMdClose size={18} className="sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>

              {/* コンテンツ */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4">
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
                    onClose={handleClose}
                    onEdit={onClickEdit}
                  />
                )}
                <span id="sidebarRewardId" className="text-center"></span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
