import useSWR from 'swr'
import Link from 'next/link'
import { useCachedSession } from '@/hooks/useCachedSession'
import { Container } from '@/components/layout/Container'
import { getLastModified } from '@/utils/string'

interface RecentBook {
  id: number
  title: string
  author: string
  image: string
  sheet: string
  created: string
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('failed')
    return res.json()
  })

// ログインユーザー自身が最近登録した本（本人にだけ表示される）
export const MyRecentBooks: React.FC = () => {
  const { session, status } = useCachedSession()
  const { data } = useSWR<{ books: RecentBook[] }>(
    status === 'authenticated' && session ? '/api/me/recent-books' : null,
    fetcher
  )

  if (!data || data.books.length === 0) return null

  const username = session?.user?.name

  return (
    <section className="border-b border-gray-100">
      <Container className="px-4 py-10 sm:py-12">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-gray-800">最近登録した本</h2>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 sm:gap-8">
          {data.books.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="w-28 shrink-0 text-center sm:w-32"
            >
              <img
                className="mx-auto mb-4 h-36 max-w-full rounded object-contain shadow-sm sm:h-40"
                src={book.image}
                alt={book.title}
              />
              <div className="line-clamp-2 h-10 text-sm leading-5 text-gray-700">
                {book.title}
              </div>
              <div className="mt-2 text-xs text-gray-400">
                {getLastModified(book.created)}
              </div>
            </Link>
          ))}
        </div>
        {username && (
          <div className="mt-4 text-right">
            <Link
              href={`/${username}/sheets`}
              className="text-xs text-blue-500 hover:underline"
            >
              自分の本棚を見る →
            </Link>
          </div>
        )}
      </Container>
    </section>
  )
}
