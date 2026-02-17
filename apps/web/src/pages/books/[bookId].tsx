import { GetStaticPaths, GetStaticProps } from 'next'
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

interface BookPageProps {
  book: Book | null
}

export default function BookPage({ book: initialBook }: BookPageProps) {
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [book, setBook] = useState(initialBook)
  const isOwner = useIsBookOwner(book)

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

  return (
    <div className="min-h-screen bg-gray-50">
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

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const bookId = params?.bookId as string

  if (!bookId) {
    return {
      notFound: true,
    }
  }

  try {
    const { default: prisma, parse } = await import('@/libs/prisma')
    const { mask } = await import('@/utils/string')
    const dayjs = (await import('dayjs')).default

    const book = await prisma.books.findFirst({
      where: { id: Number(bookId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        sheet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!book) {
      return {
        notFound: true,
      }
    }

    // ISR: 非所有者向けのページを生成（所有者のメモはクライアントサイドで取得）
    const sanitizedBook = { ...book }

    if (!book.is_public_memo) {
      // 非公開メモの場合、メモ内容を除外
      sanitizedBook.memo = null
    } else {
      // 公開メモの場合、マスキングを適用
      sanitizedBook.memo = mask(book.memo || '')
    }

    const month = book.finished
      ? dayjs(book.finished).format('M') + '月'
      : dayjs().format('M') + '月'

    await prisma.$disconnect()

    return {
      props: {
        book: parse({
          ...sanitizedBook,
          month,
          sheet_id: book.sheet_id,
          sheet: book.sheet?.name ?? null,
        }),
      },
      revalidate: 60,
    }
  } catch (error) {
    console.error('Error fetching book:', error)
    return {
      notFound: true,
    }
  }
}
