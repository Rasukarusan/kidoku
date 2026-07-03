import { useMemo } from 'react'
import {
  Tooltip,
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  Legend,
} from 'recharts'
import { TitleWithLine } from '@/components/label/TitleWithLine'
import { Book } from '@/types/book'
import { Year } from '../../types'

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

const OTHER_LABEL = 'その他'
const TOP_CATEGORY_COUNT = 5

interface Props {
  books: Book[]
  years: Year[]
}

// 生涯統計: 著者ランキングとカテゴリの変遷
export const LifetimeStats: React.FC<Props> = ({ books, years }) => {
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

  // カテゴリの変遷（シート＝年ごとの上位カテゴリ構成）
  const { evolutionData, evolutionKeys } = useMemo(() => {
    const totalByCategory: Record<string, number> = {}
    books.forEach((book) => {
      const category = book.category?.trim() || '-'
      totalByCategory[category] = (totalByCategory[category] || 0) + 1
    })
    const topCategories = Object.entries(totalByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_CATEGORY_COUNT)
      .map(([name]) => name)

    const rows = years.map(({ year }) => {
      const row: Record<string, number | string> = { year }
      topCategories.forEach((c) => (row[c] = 0))
      row[OTHER_LABEL] = 0
      books
        .filter((book) => book.sheet === year)
        .forEach((book) => {
          const category = book.category?.trim() || '-'
          const key = topCategories.includes(category)
            ? category
            : OTHER_LABEL
          row[key] = (row[key] as number) + 1
        })
      return row
    })
    return {
      evolutionData: rows,
      evolutionKeys: [...topCategories, OTHER_LABEL],
    }
  }, [books, years])

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

      {years.length > 1 && (
        <>
          <TitleWithLine text="カテゴリの変遷" />
          <div className="m-auto mb-4 h-[300px] w-full sm:w-3/4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={evolutionData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <CartesianGrid stroke="#f5f5f5" />
                <Tooltip formatter={(value) => [`${value}冊`]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {evolutionKeys.map((key, i) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId="category"
                    fill={
                      key === OTHER_LABEL
                        ? '#cbd5e1'
                        : colors[i % colors.length]
                    }
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </>
  )
}
