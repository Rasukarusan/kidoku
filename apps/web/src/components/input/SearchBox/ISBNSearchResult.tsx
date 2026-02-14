import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSetAtom } from 'jotai'
import { openAddModalAtom, openLoginModalAtom } from '@/store/modal/atom'
import { addBookAtom } from '@/store/book/atom'
import { SearchResult } from '@/types/search'
import { searchBookWithRetry } from '@/utils/bookApi'
import { normalizeISBN } from '@/utils/isbn'
import { Loading } from '@/components/icon/Loading'
import { ManualRegisterButton } from './ManualRegisterButton'

interface Props {
  isbn: string
  onClose: () => void
}

export const ISBNSearchResult: React.FC<Props> = ({ isbn }) => {
  const { data: session } = useSession()
  const setOpenLoginModal = useSetAtom(openLoginModalAtom)
  const setOpenAddModal = useSetAtom(openAddModalAtom)
  const setBook = useSetAtom(addBookAtom)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const cleaned = normalizeISBN(isbn)
    if (cleaned.length !== 10 && cleaned.length !== 13) return

    setLoading(true)
    setError('')
    setResult(null)

    const timer = setTimeout(async () => {
      try {
        const book = await searchBookWithRetry(cleaned)
        if (book) {
          setResult(book)
        } else {
          setError('書籍が見つかりませんでした')
        }
      } catch {
        setError('検索中にエラーが発生しました')
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [isbn])

  return (
    <div className="p-4">
      <div className="mb-3 text-xs font-medium text-gray-400">ISBN検索</div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loading className="mr-2 h-5 w-5 border-[3px]" />
          <span className="text-sm text-gray-500">検索中...</span>
        </div>
      )}

      {error && !loading && (
        <div className="py-8 text-center">
          <p className="mb-4 text-sm text-gray-500">{error}</p>
          <ManualRegisterButton helpText="見つからない場合は手動で登録できます" />
        </div>
      )}

      {result && !loading && (
        <div className="flex items-start gap-4 rounded-lg border border-gray-200 p-4">
          <img
            className="h-[150px] w-auto shrink-0 object-contain"
            src={result.image}
            alt={result.title}
          />
          <div className="min-w-0 flex-1">
            <div className="truncate font-bold text-gray-900">
              {result.title}
            </div>
            <div className="mt-1 truncate text-sm text-gray-500">
              {result.author}
            </div>
            <div className="mt-1 text-xs text-gray-400">{result.category}</div>
            <button
              className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
              onClick={() => {
                if (!session) {
                  setOpenLoginModal(true)
                  return
                }
                setBook(result)
                setOpenAddModal(true)
              }}
            >
              本を登録する
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
