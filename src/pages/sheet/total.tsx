import { SheetTotalPage } from '@/features/sheet/components/SheetTotal/SheetTotalPage'
import { Category, Year } from '@/features/sheet/types'
import prisma from '@/libs/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'

export default SheetTotalPage

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session) {
    return {
      props: {
        total: 0,
        categories: [],
        years: [],
      },
    }
  }
  const userId = session.user.id
  const books = await prisma.books.findMany({
    where: { userId },
  })
  // データの整形。カテゴリ名をKey, 冊数をValueとしたオブジェクトを生成
  const category_count: Record<string, number> = {}
  books.forEach((book) => {
    if (category_count[book.category]) {
      category_count[book.category] = category_count[book.category] + 1
    } else {
      category_count[book.category] = 1
    }
  })
  // カテゴリ配列作成
  const categories: Category[] = []
  Object.keys(category_count).forEach((category) => {
    const count = category_count[category]
    categories.push({
      name: category,
      count,
      percent: Math.floor((count / books.length) * 100),
    })
  })

  // 年ごとの読書数
  const result = await prisma.$queryRaw<{ name: string; count: string }[]>`
    SELECT sheets.name as name, COUNT(*) AS count
    FROM books
    JOIN sheets ON sheets.id = books.sheet_id
    WHERE books.user_id = ${userId}
    GROUP BY books.sheet_id
    ORDER BY sheets.order ASC;
  `
  const years: Year[] = result.map((sheet) => {
    return { year: sheet.name, count: parseInt(sheet.count) }
  })

  return {
    props: {
      total: books.length,
      categories,
      years,
    },
  }
}
