import { useEffect, useState } from 'react'
import { searchBooks } from '@/utils/search'
import { SearchResult } from '@/types/search'
import { FaCircleNotch, FaPlus } from 'react-icons/fa'

interface Props {
  onSelect: (book: SearchResult) => void
  disabled?: boolean
  selectedIds: Array<string | number>
}

export const BookSearch: React.FC<Props> = ({
  onSelect,
  disabled,
  selectedIds,
}) => {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const keyword = input.trim()
    if (keyword.length === 0) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    let aborted = false
    const timer = setTimeout(async () => {
      try {
        const items = await searchBooks(keyword)
        if (!aborted) setResults(items.slice(0, 20))
      } catch {
        if (!aborted) setResults([])
      } finally {
        if (!aborted) setLoading(false)
      }
    }, 500)
    return () => {
      aborted = true
      clearTimeout(timer)
    }
  }, [input])

  return (
    <div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
        placeholder="本のタイトルで検索"
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-purple-400 focus:outline-none disabled:bg-gray-100"
      />

      {loading && (
        <div className="mt-4 flex justify-center text-gray-400">
          <FaCircleNotch className="animate-spin" size={20} />
        </div>
      )}

      {!loading && results.length > 0 && (
        <ul className="mt-3 max-h-80 overflow-y-auto rounded-lg border border-gray-100">
          {results.map((book) => {
            const already = selectedIds.includes(book.id)
            return (
              <li key={book.id}>
                <button
                  onClick={() => onSelect(book)}
                  disabled={disabled || already}
                  className="flex w-full items-center gap-3 border-b border-gray-100 px-3 py-2 text-left last:border-b-0 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {book.image ? (
                    <img
                      src={book.image}
                      alt={book.title}
                      className="h-14 w-10 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <div className="h-14 w-10 shrink-0 rounded bg-gray-100" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-gray-800">
                      {book.title}
                    </div>
                    <div className="truncate text-xs text-gray-500">
                      {book.author}
                    </div>
                  </div>
                  {!already && (
                    <FaPlus className="shrink-0 text-purple-400" size={14} />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
