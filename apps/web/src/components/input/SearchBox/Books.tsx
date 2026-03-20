import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { SearchResult } from '@/types/search'
import { searchBooks } from '@/utils/search'
import { useSetAtom } from 'jotai'
import { openLoginModalAtom } from '@/store/modal/atom'
import { ManualRegisterButton } from './ManualRegisterButton'
import { Loading } from '@/components/icon/Loading'

interface Props {
  input: string
  onClose: () => void
  onSelectBook: (book: SearchResult) => void
}

export const Books: React.FC<Props> = ({ input, onSelectBook }) => {
  const setOpenLoginModal = useSetAtom(openLoginModalAtom)
  const [books, setBooks] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { data: session } = useSession()

  useEffect(() => {
    if (!input) {
      setBooks([])
      setLoading(false)
      setError('')
      return
    }

    setLoading(true)
    setError('')

    const timer = setTimeout(async () => {
      try {
        const items = await searchBooks(input)
        setBooks(items ?? [])
      } catch {
        setError('書籍検索に失敗しました。しばらくしてから再度お試しください。')
        setBooks([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [input])

  const handleClick = (item: SearchResult) => {
    if (!session) {
      setOpenLoginModal(true)
      return
    }
    onSelectBook(item)
  }

  return (
    <>
      <div className="flex flex-col">
        {/* 手動登録ボタン */}
        <div className="border-b border-gray-200 p-4">
          <ManualRegisterButton
            helpText="検索で見つからない本を手動で登録できます"
            onSelectBook={onSelectBook}
          />
        </div>

        {/* ローディング */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loading className="mr-2 h-5 w-5 border-[3px]" />
            <span className="text-sm text-gray-500">検索中...</span>
          </div>
        )}

        {/* 検索エラー */}
        {error && !loading && (
          <div className="mx-4 my-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 検索結果 */}
        {!loading && !error && (
          <div className="grid grid-cols-2 items-center justify-center gap-4 p-2 text-gray-900 sm:grid-cols-3 sm:gap-6 sm:p-4">
            {books.map((item: SearchResult, i: number) => {
              const { title, author, image } = item
              return (
                <button
                  className="group mx-auto w-full cursor-pointer rounded-lg px-2 py-3 text-center transition-all hover:bg-blue-50"
                  key={`${i}-${item.id}`}
                  onClick={() => handleClick(item)}
                >
                  <div className="mb-2">
                    <img
                      className="mx-auto mb-2 h-[140px] object-contain transition-transform group-hover:scale-105"
                      src={image}
                      alt={title}
                      loading="lazy"
                    />
                    <div className="truncate text-sm font-bold text-gray-800">
                      {title}
                    </div>
                    <div className="truncate text-xs text-gray-400">
                      {author}
                    </div>
                  </div>
                  <div className="mt-1 text-xs font-medium text-blue-500 opacity-0 transition-opacity group-hover:opacity-100">
                    登録する
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
