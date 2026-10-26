import { readSheets, readBooks, readHighlights } from '@kidoku/reading-store'
import prisma, { parse } from '@/libs/prisma'
import dayjs from 'dayjs'
import { SheetPage } from '@/features/sheet/components/SheetPage'
import { mask } from '@/utils/string'
import { migrateAnalysis } from '@/features/sheet/components/AiSummaries/migrator'

export default SheetPage

export async function getStaticProps(context) {
  const { user: username, year } = context.params
  const user = await prisma.user.findUnique({
    where: { name: username },
  })
  if (!user) {
    return {
      notFound: true,
    }
  }
  const userId = user.id
  const sheets = await readSheets(prisma, {
    where: { userId },
    orderBy: [{ position: 'desc' }],
  })
  const sheet = sheets.find((sheet) => sheet.name === year)
  if (!sheet) {
    return {
      notFound: true,
    }
  }
  const books = await readBooks(prisma, {
    filter: {
      sheetId: sheet.id,
      userId,
    },
  })
  const data = books.map((book) => {
    const month = book.finished
      ? dayjs(book.finished).format('M') + '月'
      : dayjs().format('M') + '月' // まだ読み終わっていない場合は今月とする
    const memo = book.isPublicMemo ? mask(book.memo) : ''
    return {
      id: book.id,
      userId: book.userId,
      title: book.title,
      author: book.author,
      category: book.category,
      image: book.image,
      impression: book.impression,
      isPublicMemo: book.isPublicMemo,
      isPurchasable: book.isPurchasable,
      price: book.price,
      finished: book.finished,
      month,
      memo,
    }
  })
  const yearlyTopBooks = await readHighlights(prisma, { year, username })

  const aiSummaries = await prisma.aiSummaries.findMany({
    where: { userId, sheetId: sheet.id },
    select: { id: true, analysis: true },
    orderBy: { created: 'desc' },
  })
  return {
    props: {
      data: parse(data),
      year,
      sheets: sheets.map((sheet) => ({
        id: sheet.id.toString(),
        name: sheet.name,
        order: sheet.order || 0,
      })),
      username,
      userId,
      yearlyTopBooks: yearlyTopBooks.map(({ year, order, book }) => ({
        year,
        order,
        book: {
          id: book.id,
          title: book.title,
          author: book.author,
          image: book.image,
        },
      })),
      aiSummaries: aiSummaries.map((v) => {
        // 汎用マイグレーション関数を使用して最新スキーマに変換
        // analysisはJSON文字列として保存されているのでパースが必要
        const parsedAnalysis =
          typeof v.analysis === 'string' ? JSON.parse(v.analysis) : v.analysis
        const migrated = migrateAnalysis(parsedAnalysis)
        return {
          id: v.id,
          ...migrated,
        }
      }),
    },
    revalidate: 5,
  }
}
export async function getStaticPaths() {
  const users = await prisma.user.findMany({
    select: { name: true, collections: { select: { name: true } } },
  })
  const paths = users
    .map((user) => {
      return user.collections.map((sheet) => {
        return { params: { user: user.name, year: sheet.name } }
      })
    })
    .flat()
  return {
    paths,
    fallback: 'blocking', // キャッシュが存在しない場合はSSR
  }
}
