import { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState } from 'react'
import prisma, { parse } from '@/libs/prisma'
import { Book } from '@/types/book'
import dayjs from 'dayjs'

// Three.js はSSRに対応していないため、クライアントサイドでのみ読み込む
const BookShelf3D = dynamic(
  () =>
    import('@/components/bookshelf3d/BookShelf3D').then(
      (mod) => mod.BookShelf3D
    ),
  { ssr: false }
)

type Props = {
  books: Book[]
  username: string
  year: string
  years: string[]
}

export default function Shelf3DPage({ books, username, year, years }: Props) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [currentYear, setCurrentYear] = useState(year)

  // 選択した年の本をフィルタリング（クライアントサイドでの切り替え用）
  const filteredBooks = books.filter((book) => book.sheet === currentYear)

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ヘッダー */}
      <header className="bg-gray-800 p-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href={`/${username}/sheets`}
            className="text-white hover:underline"
          >
            ← 戻る
          </Link>
          <h1 className="text-xl font-bold text-white">{username}の3D本棚</h1>
          <div className="flex items-center gap-2">
            <label htmlFor="year-select" className="text-white">
              年:
            </label>
            <select
              id="year-select"
              value={currentYear}
              onChange={(e) => setCurrentYear(e.target.value)}
              className="rounded bg-gray-700 px-2 py-1 text-white"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* 3D本棚 */}
      <main className="mx-auto max-w-6xl p-4">
        <div className="rounded-lg bg-gray-800 p-4">
          <BookShelf3D
            books={filteredBooks}
            onBookClick={(book) => setSelectedBook(book)}
          />
        </div>

        {/* 操作説明 */}
        <div className="mt-4 text-center text-sm text-gray-400">
          マウスドラッグで回転 / スクロールでズーム / 本をクリックで詳細表示
        </div>

        {/* 選択した本の詳細 */}
        {selectedBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="mx-4 max-w-md rounded-lg bg-white p-6">
              <div className="flex gap-4">
                {selectedBook.image && (
                  <img
                    src={selectedBook.image}
                    alt={selectedBook.title}
                    className="h-40 w-28 object-cover"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-lg font-bold">{selectedBook.title}</h2>
                  <p className="text-gray-600">{selectedBook.author}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    {selectedBook.category}
                  </p>
                  {selectedBook.impression && (
                    <p className="mt-2 text-2xl">{selectedBook.impression}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Link
                  href={`/books/${selectedBook.id}`}
                  className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                  詳細を見る
                </Link>
                <button
                  onClick={() => setSelectedBook(null)}
                  className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
}) => {
  const username = params?.user as string

  const user = await prisma.user.findUnique({
    where: { name: username },
  })

  if (!user) {
    return { notFound: true }
  }

  const sheets = await prisma.sheets.findMany({
    where: { userId: user.id },
    orderBy: [{ order: 'desc' }],
  })

  if (sheets.length === 0) {
    return { notFound: true }
  }

  // 全シートの本を取得
  const books = await prisma.books.findMany({
    where: {
      userId: user.id,
      sheet_id: { in: sheets.map((s) => s.id) },
    },
    select: {
      id: true,
      userId: true,
      title: true,
      author: true,
      category: true,
      image: true,
      impression: true,
      memo: true,
      is_public_memo: true,
      finished: true,
      sheet_id: true,
    },
  })

  // シートIDから年を取得するマップ
  const sheetIdToYear = new Map(sheets.map((s) => [s.id, s.name]))

  const data = books.map((book) => {
    const month = book.finished
      ? dayjs(book.finished).format('M') + '月'
      : dayjs().format('M') + '月'
    return {
      ...book,
      month,
      memo: book.is_public_memo ? book.memo : '',
      sheet: (book.sheet_id && sheetIdToYear.get(book.sheet_id)) || '',
    }
  })

  const years = sheets.map((s) => s.name)
  const latestYear = years[0] || new Date().getFullYear().toString()

  return {
    props: {
      books: parse(data) as Book[],
      username,
      year: latestYear,
      years,
    },
  }
}
