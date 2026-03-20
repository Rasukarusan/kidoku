import { Modal } from '@/components/layout/Modal'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { AiOutlineCamera, AiOutlineSearch } from 'react-icons/ai'
import { AnimatePresence, motion } from 'framer-motion'
import { Books } from './Books'
import { UserBooks } from './UserBooks'
import { BarcodeScan } from './BarcodeScan'
import { openSearchModalAtom } from '@/store/modal/atom'
import { useAtom } from 'jotai'
import { Template } from './Template'
import { ISBNSearchResult } from './ISBNSearchResult'
import { RegisterForm } from './RegisterForm'
import { SuccessView } from './SuccessView'
import { SearchResult } from '@/types/search'

/**
 * 入力がISBN形式かどうかを判定する
 * ハイフン・スペースを除去した後、10桁または13桁の数字（ISBN-10は末尾Xも可）であればISBNと判定
 */
const isISBNLike = (input: string): boolean => {
  const cleaned = input.replace(/[-\s]/g, '')
  if (cleaned.length === 10) {
    return /^\d{9}[\dX]$/i.test(cleaned)
  }
  if (cleaned.length === 13) {
    return /^\d{13}$/.test(cleaned)
  }
  return false
}

type View = 'search' | 'register' | 'success'

interface SuccessData {
  bookTitle: string
  bookImage: string
  sheetName: string
}

export const SearchModal: React.FC = () => {
  const [open, setOpen] = useAtom(openSearchModalAtom)
  const ref = useRef<HTMLInputElement>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [view, setView] = useState<View>('search')
  const [selectedBook, setSelectedBook] = useState<SearchResult | null>(null)
  const [successData, setSuccessData] = useState<SuccessData | null>(null)
  const { data: session } = useSession()
  const router = useRouter()

  // モーダル開いたら自動でinputフィールドにフォーカスする（検索ビュー、カメラモード以外）
  useEffect(() => {
    if (view === 'search' && !showCamera) {
      ref.current?.focus()
    }
  }, [open, showCamera, view])

  // モーダルが閉じたらリセット
  useEffect(() => {
    if (!open) {
      // 少し遅延させてアニメーション後にリセット
      const timer = setTimeout(() => {
        setView('search')
        setSelectedBook(null)
        setSuccessData(null)
        setInputValue('')
        setShowCamera(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [open])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (showCamera) {
      setShowCamera(false)
    }
    setInputValue(e.target.value)
  }

  const onClose = () => {
    setOpen(false)
  }

  const handleSelectBook = (book: SearchResult) => {
    setSelectedBook(book)
    setView('register')
  }

  const handleBack = () => {
    setView('search')
    setSelectedBook(null)
  }

  const handleSuccess = (response: {
    bookTitle: string
    bookId: number
    sheetName: string
  }) => {
    setSuccessData({
      bookTitle: response.bookTitle,
      bookImage: selectedBook?.image || '',
      sheetName: response.sheetName,
    })
    setView('success')
  }

  const handleGoToSheet = () => {
    onClose()
    if (session && successData) {
      router.push(`/${session.user.name}/sheets/${successData.sheetName}`)
    }
  }

  const isISBN = isISBNLike(inputValue)

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="h-3/4 w-full overflow-hidden sm:w-3/4 lg:w-1/2"
    >
      <AnimatePresence mode="wait">
        {view === 'search' && (
          <motion.div
            key="search"
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.15 }}
            className="flex h-full flex-col"
          >
            {/* 検索入力 + カメラボタン */}
            <div className="flex shrink-0 items-center border-b border-b-[#f1f5f9] px-2 pt-2">
              <div className="relative w-full text-gray-600">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                  <button
                    type="submit"
                    className="focus:shadow-outline p-1 focus:outline-none"
                  >
                    <AiOutlineSearch size={20} />
                  </button>
                </span>
                <input
                  ref={ref}
                  type="search"
                  name="q"
                  className="h-12 w-full appearance-none rounded-md bg-white py-2 pl-16 pr-12 text-sm text-gray-900 focus:outline-none"
                  placeholder="本のタイトルまたはISBNを入力..."
                  autoComplete="off"
                  onChange={onChange}
                  value={inputValue}
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <button
                    type="button"
                    className={`rounded-md p-2 transition-colors ${
                      showCamera
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                    }`}
                    onClick={() => setShowCamera(!showCamera)}
                    title="バーコードスキャン"
                  >
                    <AiOutlineCamera size={20} />
                  </button>
                </span>
              </div>
            </div>

            {/* コンテンツエリア */}
            <div className="flex-1 overflow-y-auto">
              {showCamera ? (
                <BarcodeScan
                  input={inputValue}
                  onClose={onClose}
                  onSelectBook={handleSelectBook}
                />
              ) : inputValue ? (
                isISBN ? (
                  <ISBNSearchResult
                    isbn={inputValue}
                    onClose={onClose}
                    onSelectBook={handleSelectBook}
                  />
                ) : (
                  <>
                    <Books
                      input={inputValue}
                      onClose={onClose}
                      onSelectBook={handleSelectBook}
                    />
                    {/* ユーザー本棚セクション */}
                    <div className="border-t border-gray-200">
                      <div className="px-4 pt-3 text-xs font-medium text-gray-400">
                        ユーザー本棚
                      </div>
                      <UserBooks input={inputValue} onClose={onClose} />
                    </div>
                  </>
                )
              ) : (
                <Template
                  input={inputValue}
                  onClose={onClose}
                  onSelectBook={handleSelectBook}
                />
              )}
            </div>
          </motion.div>
        )}

        {view === 'register' && selectedBook && (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            <RegisterForm
              item={selectedBook}
              onBack={handleBack}
              onSuccess={handleSuccess}
            />
          </motion.div>
        )}

        {view === 'success' && successData && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <SuccessView
              bookTitle={successData.bookTitle}
              bookImage={successData.bookImage}
              sheetName={successData.sheetName}
              onGoToSheet={handleGoToSheet}
              onClose={onClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}
