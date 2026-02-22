import { GetStaticPaths, GetStaticProps } from 'next'
import BookPage from '@/features/books/components/BookPage'

export default BookPage

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

    if (!book.isPublicMemo) {
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
          sheetId: book.sheetId,
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
