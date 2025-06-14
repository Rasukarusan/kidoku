import prisma, { parse } from '@/libs/prisma'
import dayjs from 'dayjs'
import { SheetPage } from '@/features/sheet/components/SheetPage'
import { mask } from '@/utils/string'
export default SheetPage

type Props = { params: { year: string } }
export async function getStaticProps(context) {
  const { user: username, year } = context.params

  try {
    // 一つのクエリで必要なデータを取得
    const [user, userWithSheets] = await Promise.all([
      prisma.user.findUnique({
        where: { name: username },
        select: { id: true, name: true },
      }),
      prisma.user.findUnique({
        where: { name: username },
        select: {
          sheets: {
            select: { id: true, name: true },
            orderBy: [{ order: 'desc' }],
          },
        },
      }),
    ])

    if (!user || !userWithSheets) {
      return { notFound: true }
    }

    const sheet = userWithSheets.sheets.find((s) => s.name === year)
    if (!sheet) {
      return { notFound: true }
    }

    // 並列でデータ取得
    const [books, yearlyTopBooks, aiSummaries] = await Promise.all([
      prisma.books.findMany({
        where: {
          sheet_id: sheet.id,
          userId: user.id,
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
        },
      }),
      prisma.yearlyTopBook.findMany({
        where: { year, userId: user.id },
        select: {
          year: true,
          order: true,
          book: {
            select: { id: true, title: true, author: true, image: true },
          },
        },
        orderBy: { order: 'asc' },
      }),
      prisma.aiSummaries.findMany({
        where: { userId: user.id, sheet_id: sheet.id },
        select: { analysis: true },
      }),
    ])

    const data = books.map((book) => {
      const month = book.finished
        ? dayjs(book.finished).format('M') + '月'
        : dayjs().format('M') + '月'
      const memo = book.is_public_memo ? mask(book.memo) : ''
      return { ...book, month, memo }
    })

    return {
      props: {
        data: parse(data),
        year,
        sheets: userWithSheets.sheets.map((s) => s.name),
        username,
        yearlyTopBooks,
        aiSummaries: aiSummaries.map((v) => v.analysis),
      },
      revalidate: 60, // 1分から5秒に変更
    }
  } catch (error) {
    console.error('Error in getStaticProps:', error)
    return { notFound: true }
  }
}
export async function getStaticPaths() {
  // ビルド時は最小限のパスのみ生成し、他はISRで対応
  if (process.env.NODE_ENV === 'production') {
    return {
      paths: [], // ビルド時は空のパス
      fallback: 'blocking',
    }
  }

  // 開発時は一部のパスのみ生成
  const users = await prisma.user.findMany({
    select: { name: true, sheets: { select: { name: true } } },
    take: 5, // 最初の5ユーザーのみ
  })
  const paths = users
    .map((user) => {
      return user.sheets.slice(0, 3).map((sheet) => {
        // 最初の3シートのみ
        return { params: { user: user.name, year: sheet.name } }
      })
    })
    .flat()
  return {
    paths,
    fallback: 'blocking',
  }
}
