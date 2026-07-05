import { useMemo } from 'react'
import { TitleWithLine } from '@/components/label/TitleWithLine'
import { Book } from '@/types/book'

// YearsGraph と同じパレットを使用
const colors = [
  '#003049',
  '#021E66',
  '#D62828',
  '#F77F00',
  '#564779',
  '#FCBF49',
  '#EAE2B7',
  '#F76E7C',
  '#F73668',
  '#FF7F75',
  '#F0EAD8',
  '#2B2F6C',
]

interface Props {
  books: Book[]
}

// 生涯統計: 著者ランキング
export const LifetimeStats: React.FC<Props> = ({ books }) => {
  // 著者ランキング（上位10）
  const authorRanking = useMemo(() => {
    const counts: Record<string, number> = {}
    books.forEach((book) => {
      const author = book.author?.trim()
      if (!author || author === '-') return
      counts[author] = (counts[author] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [books])

  const uniqueAuthors = useMemo(() => {
    return new Set(
      books.map((b) => b.author?.trim()).filter((a) => a && a !== '-')
    ).size
  }, [books])

  const uniqueCategories = useMemo(() => {
    return new Set(
      books.map((b) => b.category?.trim()).filter((c) => c && c !== '-')
    ).size
  }, [books])

  if (books.length === 0) return null

  const maxAuthorCount = authorRanking[0]?.count ?? 0

  return (
    <>
      <TitleWithLine text="読んだ著者" />
      <div className="m-auto mb-2 flex justify-center gap-8 text-sm text-gray-500">
        <div>
          <span className="mr-1 text-2xl font-bold text-gray-800">
            {uniqueAuthors}
          </span>
          人の著者
        </div>
        <div>
          <span className="mr-1 text-2xl font-bold text-gray-800">
            {uniqueCategories}
          </span>
          のカテゴリ
        </div>
      </div>
      {authorRanking.length > 0 && (
        <div className="m-auto mb-10 w-full max-w-lg px-4 text-left">
          {authorRanking.map((author, i) => (
            <div key={author.name} className="mb-2">
              <div className="mb-0.5 flex items-baseline justify-between text-sm">
                <span className="truncate">
                  <span className="mr-2 inline-block w-5 text-right text-gray-400">
                    {i + 1}
                  </span>
                  {author.name}
                </span>
                <span className="ml-2 shrink-0 text-xs text-gray-500">
                  {author.count}冊
                </span>
              </div>
              <div className="ml-7 h-2 rounded bg-gray-100">
                <div
                  className="h-2 rounded"
                  style={{
                    width: `${(author.count / maxAuthorCount) * 100}%`,
                    backgroundColor: colors[i % colors.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
