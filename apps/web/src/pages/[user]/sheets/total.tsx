import { SheetTotalPage } from '@/features/sheet/components/SheetTotal/SheetTotalPage'
import { Category, Year } from '@/features/sheet/types'
import prisma from '@/libs/prisma'
import { isSSGEnabled } from '@/libs/env'

export default SheetTotalPage

const fetchTotalData = async (ctx) => {
  const { user: username } = ctx.params
  const user = await prisma.user.findUnique({
    where: { name: username },
  })
  if (!user) {
    return {
      notFound: true,
    }
  }
  const userId = user.id
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

  const sheets = await prisma.sheets.findMany({
    where: { userId },
    orderBy: [{ order: 'desc' }],
  })

  const yearlyTopBooks = await prisma.yearlyTopBook.findMany({
    where: { userId },
    select: {
      year: true,
      order: true,
      book: { select: { title: true, author: true, image: true } },
    },
    orderBy: { year: 'desc' },
  })
  return {
    props: {
      total: books.length,
      categories,
      years,
      sheets:
        sheets.length === 0
          ? []
          : sheets.map((sheet) => ({
              id: sheet.id.toString(),
              name: sheet.name,
              order: sheet.order || 0,
            })),
      username,
      userId,
      yearlyTopBooks,
    },
  }
}

// 本番環境: SSG (ISR)
export const getStaticProps = isSSGEnabled
  ? async (ctx) => ({ ...(await fetchTotalData(ctx)), revalidate: 5 })
  : undefined

export const getStaticPaths = isSSGEnabled
  ? async () => {
      const users = await prisma.user.findMany({
        select: { name: true },
      })
      const paths = users
        .map((user) => {
          return { params: { user: user.name } }
        })
        .flat()
      return {
        paths,
        fallback: 'blocking',
      }
    }
  : undefined

// 開発・プレビュー環境: SSR
export const getServerSideProps = !isSSGEnabled
  ? async (ctx) => await fetchTotalData(ctx)
  : undefined
