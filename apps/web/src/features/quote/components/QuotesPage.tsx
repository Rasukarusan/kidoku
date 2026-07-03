import { useMemo, useState } from 'react'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import { useQuery } from '@apollo/client'
import { ImQuotesLeft } from 'react-icons/im'
import dayjs from 'dayjs'
import { Container } from '@/components/layout/Container'
import { MyQuote, myQuotesQuery } from '../api'

// 自分の引用を横断で見返す「引用ノート」ページ
export const QuotesPage: React.FC = () => {
  const { data, loading } = useQuery<{ myQuotes: MyQuote[] }>(myQuotesQuery)
  const [keyword, setKeyword] = useState('')
  const quotes = useMemo(() => {
    const all = data?.myQuotes ?? []
    if (!keyword.trim()) return all
    const lower = keyword.toLowerCase()
    return all.filter(
      (q) =>
        q.text.toLowerCase().includes(lower) ||
        q.bookTitle.toLowerCase().includes(lower) ||
        (q.comment ?? '').toLowerCase().includes(lower)
    )
  }, [data, keyword])

  return (
    <Container className="px-4 py-8 sm:px-10 sm:py-10">
      <NextSeo title="引用ノート | kidoku" noindex />
      <h2 className="mb-2 text-2xl font-bold">引用ノート</h2>
      <p className="mb-6 text-sm text-gray-500">
        本に残した引用・抜き書きを横断で見返せます。あなただけに表示されます。
      </p>

      <input
        value={keyword}
        placeholder="引用文・本のタイトルで検索"
        className="mb-6 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:bg-white sm:w-96"
        onChange={(e) => setKeyword(e.target.value)}
      />

      {loading && <p className="text-sm text-gray-400">読み込み中...</p>}

      {!loading && quotes.length === 0 && (
        <p className="text-sm text-gray-400">
          {keyword
            ? '該当する引用が見つかりませんでした。'
            : 'まだ引用がありません。本の詳細画面から追加できます。'}
        </p>
      )}

      <div className="space-y-4">
        {quotes.map((quote) => (
          <div
            key={quote.id}
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <div className="flex items-start gap-3">
              <ImQuotesLeft className="mt-1 shrink-0 text-gray-300" />
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                  {quote.text}
                </p>
                {quote.comment && (
                  <p className="mt-2 text-xs text-gray-500">{quote.comment}</p>
                )}
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={quote.bookImage}
                    alt={quote.bookTitle}
                    className="h-12 w-9 rounded object-cover shadow-sm"
                  />
                  <div className="min-w-0">
                    <Link
                      href={`/books/${quote.bookId}`}
                      className="block truncate text-xs font-bold text-gray-700 hover:underline"
                    >
                      {quote.bookTitle}
                    </Link>
                    <div className="text-xs text-gray-400">
                      {quote.bookAuthor}
                      {quote.page ? ` ・ P.${quote.page}` : ''} ・{' '}
                      {dayjs(quote.created).format('YYYY/MM/DD')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Container>
  )
}
