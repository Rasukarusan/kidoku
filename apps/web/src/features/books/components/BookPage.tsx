import Link from 'next/link'
import { useRouter } from 'next/router'
import { Book } from '@/types/book'
import { BookDetailReadModal } from '@/features/sheet/components/BookDetailReadModal'
import { BookDetailEditPage } from '@/features/sheet/components/BookDetailEditPage'
import { useEffect, useState } from 'react'
import { MdChevronRight } from 'react-icons/md'
import { useIsBookOwner } from '@/hooks/useIsBookOwner'
import apolloClient from '@/libs/apollo'
import { getBookQuery } from '@/features/books/api/queries'
import { NextSeo } from 'next-seo'

interface BookPageProps {
  book: Book | null
}

export default function BookPage({ book: initialBook }: BookPageProps) {
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [book, setBook] = useState(initialBook)
  const isOwner = useIsBookOwner(book)

  // ナビゲーション時にpropsの変更を反映
  useEffect(() => {
    setBook(initialBook)
    setEditMode(false)
  }, [initialBook])

  // 所有者の場合、GraphQL経由で完全なメモデータを取得
  useEffect(() => {
    if (!isOwner || !book) return
    const fetchOwnerBook = async () => {
      try {
        const { data } = await apolloClient.query({
          query: getBookQuery,
          variables: { input: { id: String(book.id) } },
          fetchPolicy: 'network-only',
        })
        if (data?.book?.memo !== undefined) {
          setBook((prev) => ({ ...prev, memo: data.book.memo }))
        }
      } catch {
        // フォールバック: ISRで生成されたデータをそのまま使用
      }
    }
    fetchOwnerBook()
  }, [isOwner, book?.id])

  if (!book) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-800">
            書籍が見つかりません
          </h1>
          <button
            onClick={() => router.back()}
            className="text-blue-600 underline hover:text-blue-800"
          >
            戻る
          </button>
        </div>
      </div>
    )
  }

  const handleClose = () => {
    router.back()
  }

  const handleEditToggle = () => {
    setEditMode(!editMode)
  }

  const sheetUrl =
    book.user && book.sheet ? `/${book.user.name}/sheets/${book.sheet}` : null
  const host = process.env.NEXT_PUBLIC_HOST || 'https://kidoku.net'
  const ogImage = `${host}/api/og?type=book&user=${encodeURIComponent(book.user?.name ?? 'kidoku user')}&title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author)}&category=${encodeURIComponent(book.category)}`
  const pageUrl = `${host}/books/${book.id}`

  return (
    <div className="min-h-screen bg-gray-50">
      <NextSeo
        title={`${book.title} | kidoku`}
        description={`${book.author} / ${book.category} の読書メモ`}
        canonical={pageUrl}
        openGraph={{
          title: `${book.title} | kidoku`,
          description: `${book.author} / ${book.category} の読書メモ`,
          url: pageUrl,
          images: [{ url: ogImage, width: 1200, height: 630 }],
        }}
        twitter={{ cardType: 'summary_large_image' }}
      />
      <div className="mx-auto max-w-4xl py-8">
        {sheetUrl && (
          <nav
            aria-label="パンくずリスト"
            className="mb-4 px-4 text-sm text-gray-500"
          >
            <ol className="flex items-center">
              <li>
                <Link
                  href={sheetUrl}
                  className="hover:text-gray-700 hover:underline"
                >
                  {book.sheet}
                </Link>
              </li>
              <li className="flex items-center">
                <MdChevronRight className="mx-1" size={16} />
                <span className="truncate text-gray-800">{book.title}</span>
              </li>
            </ol>
          </nav>
        )}
        {editMode && isOwner ? (
          <BookDetailEditPage
            book={book}
            onClose={handleClose}
            onCancel={handleEditToggle}
          />
        ) : (
          <BookDetailReadModal
            book={book}
            onClose={handleClose}
            onEdit={isOwner ? handleEditToggle : undefined}
          />
        )}
      </div>
    </div>
  )
}
