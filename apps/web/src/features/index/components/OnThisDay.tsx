import useSWR from 'swr'
import Link from 'next/link'
import { useCachedSession } from '@/hooks/useCachedSession'
import { Container } from '@/components/layout/Container'

interface OnThisDayBook {
  id: number
  title: string
  author: string
  image: string
  yearsAgo: number
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('failed')
    return res.json()
  })

// 「◯年前の今日」読み終えた本（本人にだけ表示される）
export const OnThisDay: React.FC = () => {
  const { status, session } = useCachedSession()
  const { data } = useSWR<{ books: OnThisDayBook[] }>(
    status === 'authenticated' && session ? '/api/me/on-this-day' : null,
    fetcher
  )

  if (!data || data.books.length === 0) return null

  return (
    <section className="border-b border-gray-100 bg-gray-50">
      <Container className="px-4 py-8">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-gray-800">あの日の一冊</h2>
          <span className="text-xs text-gray-400">あなただけに表示</span>
        </div>
        <div className="space-y-3">
          {data.books.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="flex items-center gap-4 rounded p-2 transition-colors hover:bg-white"
            >
              <img
                className="h-20 w-14 min-w-14 rounded object-cover shadow-sm"
                src={book.image}
                alt={book.title}
              />
              <div>
                <div className="text-xs font-bold text-teal-700">
                  {book.yearsAgo}年前の今日、読み終えました
                </div>
                <div className="mt-1 text-sm font-bold text-gray-800">
                  {book.title}
                </div>
                <div className="text-xs text-gray-500">{book.author}</div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}
