import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { NextSeo } from 'next-seo'
import dayjs from 'dayjs'
import { Container } from '@/components/layout/Container'

interface ReportBook {
  id: number
  title: string
  author: string
  category: string
  image: string
  impression: string
  finished: string | null
  memoLength: number
}

interface ReportResponse {
  sheets: Array<{ id: number; name: string }>
  report: {
    sheetName: string
    books: ReportBook[]
  } | null
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('failed')
    return res.json()
  })

const Stat: React.FC<{ value: string | number; label: string }> = ({
  value,
  label,
}) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
    <div className="text-2xl font-bold text-gray-800">{value}</div>
    <div className="mt-1 text-xs text-gray-500">{label}</div>
  </div>
)

// 自分だけでじっくり読む年間レポート。ブラウザの印刷機能でPDF保存できる
export const AnnualReportPage: React.FC = () => {
  const [selectedSheet, setSelectedSheet] = useState('')
  const { data, isLoading } = useSWR<ReportResponse>(
    `/api/me/annual-report${selectedSheet ? `?sheet=${encodeURIComponent(selectedSheet)}` : ''}`,
    fetcher
  )

  const report = data?.report
  const books = useMemo(() => report?.books ?? [], [report])

  const stats = useMemo(() => {
    const finishedBooks = books.filter((b) => b.finished)
    const monthly: Record<string, number> = {}
    finishedBooks.forEach((book) => {
      const month = dayjs(book.finished as string).format('M月')
      monthly[month] = (monthly[month] || 0) + 1
    })
    const categories: Record<string, number> = {}
    books.forEach((book) => {
      const c = book.category?.trim() || '-'
      categories[c] = (categories[c] || 0) + 1
    })
    const totalMemoLength = books.reduce((sum, b) => sum + b.memoLength, 0)
    const longestMemoBook = [...books].sort(
      (a, b) => b.memoLength - a.memoLength
    )[0]
    const busiestMonth = Object.entries(monthly).sort((a, b) => b[1] - a[1])[0]
    return {
      monthly,
      categories: Object.entries(categories).sort((a, b) => b[1] - a[1]),
      totalMemoLength,
      longestMemoBook,
      busiestMonth,
    }
  }, [books])

  const monthLabels = Array.from({ length: 12 }, (_, i) => `${i + 1}月`)
  const maxMonthly = Math.max(1, ...Object.values(stats.monthly))

  return (
    <Container className="px-4 py-8 sm:px-10 sm:py-10">
      <NextSeo title="年間レポート | kidoku" noindex />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <h2 className="text-2xl font-bold">年間レポート</h2>
        <div className="flex items-center gap-2">
          <select
            value={selectedSheet || report?.sheetName || ''}
            className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
            onChange={(e) => setSelectedSheet(e.target.value)}
          >
            {(data?.sheets ?? []).map((sheet) => (
              <option key={sheet.id} value={sheet.name}>
                {sheet.name}
              </option>
            ))}
          </select>
          <button
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            onClick={() => window.print()}
          >
            印刷 / PDF保存
          </button>
        </div>
      </div>
      <p className="mb-8 text-sm text-gray-500 print:hidden">
        あなただけの詳細な読書レポートです。他のユーザーには表示されません。
      </p>

      {isLoading && <p className="text-sm text-gray-400">読み込み中...</p>}

      {!isLoading && report && (
        <>
          <h3 className="mb-4 hidden text-xl font-bold print:block">
            {report.sheetName} 読書レポート
          </h3>

          {/* サマリー */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat value={books.length} label="読んだ本" />
            <Stat
              value={stats.totalMemoLength.toLocaleString()}
              label="書いたメモの文字数"
            />
            <Stat value={stats.categories.length} label="読んだカテゴリ" />
            <Stat
              value={stats.busiestMonth ? stats.busiestMonth[0] : '—'}
              label={`いちばん読んだ月${stats.busiestMonth ? `（${stats.busiestMonth[1]}冊）` : ''}`}
            />
          </div>

          {/* 月別 */}
          <section className="mb-8">
            <h4 className="mb-3 text-sm font-bold text-gray-700">
              月別の読了数
            </h4>
            <div className="flex h-32 items-end gap-1">
              {monthLabels.map((month) => {
                const count = stats.monthly[month] || 0
                return (
                  <div key={month} className="flex-1 text-center">
                    <div className="mb-1 text-xs text-gray-500">
                      {count > 0 ? count : ''}
                    </div>
                    <div
                      className="mx-auto w-full max-w-8 rounded-t bg-teal-600"
                      style={{ height: `${(count / maxMonthly) * 80}px` }}
                    />
                    <div className="mt-1 text-[10px] text-gray-400">
                      {month}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* カテゴリ内訳 */}
          <section className="mb-8">
            <h4 className="mb-3 text-sm font-bold text-gray-700">
              カテゴリ内訳
            </h4>
            <div className="flex flex-wrap gap-2">
              {stats.categories.map(([category, count]) => (
                <span
                  key={category}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs text-gray-700"
                >
                  {category} {count}冊
                </span>
              ))}
            </div>
          </section>

          {/* いちばん語った本 */}
          {stats.longestMemoBook && stats.longestMemoBook.memoLength > 0 && (
            <section className="mb-8">
              <h4 className="mb-3 text-sm font-bold text-gray-700">
                いちばん語った本
              </h4>
              <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
                <img
                  src={stats.longestMemoBook.image}
                  alt={stats.longestMemoBook.title}
                  className="h-20 w-14 rounded object-cover shadow-sm"
                />
                <div>
                  <div className="text-sm font-bold text-gray-800">
                    {stats.longestMemoBook.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stats.longestMemoBook.author}
                  </div>
                  <div className="mt-1 text-xs text-teal-700">
                    メモ {stats.longestMemoBook.memoLength.toLocaleString()}{' '}
                    文字
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 読了一覧 */}
          <section>
            <h4 className="mb-3 text-sm font-bold text-gray-700">
              読んだ本の一覧
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-gray-400">
                    <th className="py-2 pr-4 font-normal">読了日</th>
                    <th className="py-2 pr-4 font-normal">タイトル</th>
                    <th className="py-2 pr-4 font-normal">著者</th>
                    <th className="py-2 pr-4 font-normal">カテゴリ</th>
                    <th className="py-2 pr-4 font-normal">評価</th>
                    <th className="py-2 font-normal">メモ</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.id} className="border-b border-slate-100">
                      <td className="py-2 pr-4 text-xs text-gray-500">
                        {book.finished
                          ? dayjs(book.finished).format('MM/DD')
                          : '—'}
                      </td>
                      <td className="py-2 pr-4 font-medium text-gray-800">
                        {book.title}
                      </td>
                      <td className="py-2 pr-4 text-gray-600">{book.author}</td>
                      <td className="py-2 pr-4 text-gray-600">
                        {book.category}
                      </td>
                      <td className="py-2 pr-4">{book.impression}</td>
                      <td className="py-2 text-xs text-gray-500">
                        {book.memoLength > 0
                          ? `${book.memoLength.toLocaleString()}字`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </Container>
  )
}
