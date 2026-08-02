import Link from 'next/link'
import useSWR from 'swr'
import { TitleWithLine } from '@/components/label/TitleWithLine'
import { useCachedSession } from '@/hooks/useCachedSession'
import { NO_IMAGE } from '@/libs/constants'

interface OnThisDayBook {
  id: number
  title: string
  author: string
  image: string
  yearsAgo: number
}

const fetcher = (url: string) =>
  fetch(url).then((response) => {
    if (!response.ok) throw new Error('failed')
    return response.json()
  })

/** ログインユーザーが過去の同じ日に読み終えた本を振り返るコーナー。 */
export const OnThisDaySection: React.FC = () => {
  const { session, status } = useCachedSession()
  const { data } = useSWR<{ books: OnThisDayBook[] }>(
    status === 'authenticated' && session ? '/api/me/on-this-day' : null,
    fetcher
  )

  const books = data?.books ?? []
  if (books.length === 0) return null

  return (
    <section className="mb-12">
      <TitleWithLine text="〇〇年前の今日、これ読みました" className="mb-4" />
      <div className="flex gap-4 overflow-x-auto pb-3">
        {books.map((book) => (
          <Link
            key={book.id}
            href={`/books/${book.id}`}
            className="flex w-72 min-w-72 items-center gap-4 rounded-xl border border-teal-100 bg-teal-50/50 p-4 transition hover:border-teal-200 hover:bg-teal-50"
          >
            <img
              src={book.image || NO_IMAGE}
              alt={book.title}
              className="h-28 w-20 shrink-0 rounded object-cover shadow-sm"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-teal-700">
                {book.yearsAgo}年前の今日
              </p>
              <h3 className="mt-1 line-clamp-2 text-sm font-bold text-gray-800">
                {book.title}
              </h3>
              {book.author && (
                <p className="mt-1 truncate text-xs text-gray-500">
                  {book.author}
                </p>
              )}
              <p className="mt-3 text-xs text-teal-700">読書記録を見る →</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
