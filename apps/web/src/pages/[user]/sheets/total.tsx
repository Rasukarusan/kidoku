import { SheetTotalPage } from '@/features/sheet/components/SheetTotal/SheetTotalPage'
import { Category, Year } from '@/features/sheet/types'
import prisma from '@/libs/prisma'

export default SheetTotalPage

export const getStaticProps = async (ctx) => {
  const { user: username } = ctx.params
  
  try {
    const user = await prisma.user.findUnique({
      where: { name: username },
      select: { id: true, name: true },
    })
    
    if (!user) {
      return { notFound: true }
    }
    
    // 並列でデータ取得
    const [books, sheets, yearlyTopBooks, aiSummaries, yearStats] = await Promise.all([
      prisma.books.findMany({
        where: { userId: user.id },
        select: { category: true }, // 必要なフィールドのみ
      }),
      prisma.sheets.findMany({
        where: { userId: user.id },
        select: { name: true },
        orderBy: [{ order: 'desc' }],
      }),
      prisma.yearlyTopBook.findMany({
        where: { userId: user.id },
        select: {
          year: true,
          order: true,
          book: { select: { title: true, author: true, image: true } },
        },
        orderBy: { year: 'desc' },
      }),
      prisma.aiSummaries.findMany({
        where: { userId: user.id, sheet_id: 0 },
        select: { analysis: true },
      }),
      // 最適化された年統計クエリ
      prisma.$queryRaw<{ name: string; count: string }[]>`
        SELECT sheets.name as name, COUNT(*) AS count
        FROM books
        JOIN sheets ON sheets.id = books.sheet_id
        WHERE books.user_id = ${user.id}
        GROUP BY books.sheet_id, sheets.name
        ORDER BY sheets.order ASC
      `,
    ])
    
    // カテゴリ集計の最適化
    const categoryCount = books.reduce((acc, book) => {
      acc[book.category] = (acc[book.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const categories: Category[] = Object.entries(categoryCount).map(([name, count]) => ({
      name,
      count,
      percent: Math.floor((count / books.length) * 100),
    }))
    
    const years: Year[] = yearStats.map((sheet) => ({
      year: sheet.name,
      count: parseInt(sheet.count),
    }))
    
    return {
      props: {
        total: books.length,
        categories,
        years,
        sheets: sheets.map((sheet) => sheet.name),
        username,
        yearlyTopBooks,
        aiSummaries: aiSummaries.map((v) => v.analysis),
      },
      revalidate: 300, // 5分に延長
    }
  } catch (error) {
    console.error('Error in getStaticProps:', error)
    return { notFound: true }
  }
}

export async function getStaticPaths() {
  // ビルド時は最小限のパスのみ生成
  if (process.env.NODE_ENV === 'production') {
    return {
      paths: [], // ビルド時は空のパス
      fallback: 'blocking',
    }
  }
  
  // 開発時は一部のパスのみ生成
  const users = await prisma.user.findMany({
    select: { name: true },
    take: 5, // 最初の5ユーザーのみ
  })
  const paths = users.map((user) => ({
    params: { user: user.name }
  }))
  return {
    paths,
    fallback: 'blocking',
  }
}
