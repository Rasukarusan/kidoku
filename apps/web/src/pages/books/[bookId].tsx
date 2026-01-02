import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { Book } from '@/types/book'
import { BookDetailReadModal } from '@/features/sheet/components/BookDetailReadModal'
import { BookDetailEditPage } from '@/features/sheet/components/BookDetailEditPage'
import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface BookPageProps {
  book: Book | null
}

export default function BookPage({ book }: BookPageProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [editMode, setEditMode] = useState(false)

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

  const isOwner = session?.user?.id === book.userId

  const handleClose = () => {
    router.back()
  }

  const handleEditToggle = () => {
    setEditMode(!editMode)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl py-8">
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

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
  res,
}) => {
  const bookId = params?.bookId as string

  if (!bookId) {
    return {
      notFound: true,
    }
  }

  try {
    const { getServerSession } = await import('next-auth/next')
    const { authOptions } = await import('@/pages/api/auth/[...nextauth]')
    const { default: prisma, parse } = await import('@/libs/prisma')
    const { mask } = await import('@/utils/string')
    const dayjs = (await import('dayjs')).default

    const session = await getServerSession(req, res, authOptions)

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

    // セキュリティ: 非公開メモは所有者以外に送信しない
    const isOwner = session?.user?.id === book.userId
    const sanitizedBook = { ...book }

    if (!isOwner && !book.is_public_memo) {
      // 非公開メモの場合、メモ内容を除外
      sanitizedBook.memo = null
    } else if (!isOwner && book.is_public_memo) {
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
    }
  } catch (error) {
    console.error('Error fetching book:', error)
    return {
      notFound: true,
    }
  }
}
