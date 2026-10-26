import { readBooks, readSheets, readHighlights } from '@kidoku/reading-store'
import { SheetTotalPage } from '@/features/sheet/components/SheetTotal/SheetTotalPage'
import { Category, Year } from '@/features/sheet/types'
import prisma, { parse } from '@/libs/prisma'
import { mask } from '@/utils/string'
import dayjs from 'dayjs'

export default SheetTotalPage

export const getStaticProps = async (ctx) => {
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
  const books = await readBooks(prisma, { filter: { userId } })
  // 全シート横断の書籍データ（カテゴリーフィルター表示用）
  // 公開ページのため、非公開メモは表示しない（[year].tsx と同様の整形）
  const booksData = parse(
    books.map((book) => {
      const month = book.finished
        ? dayjs(book.finished).format('M') + '月'
        : dayjs().format('M') + '月'
      return {
        id: book.id,
        userId: book.userId,
        month,
        title: book.title,
        author: book.author,
        category: book.category,
        image: book.image,
        impression: book.impression,
        memo: book.isPublicMemo ? mask(book.memo) : '',
        finished: book.finished,
        isPublicMemo: book.isPublicMemo,
        isPurchasable: book.isPurchasable,
        price: book.price,
        sheetId: book.sheetId,
        sheet: book.sheet?.name ?? '',
      }
    })
  )
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

  const sheets = await readSheets(prisma, {
    where: { userId },
    orderBy: { position: 'desc' },
  })
  const counts = new Map<number, number>()
  for (const book of books)
    counts.set(book.sheetId, (counts.get(book.sheetId) ?? 0) + 1)
  const years: Year[] = [...sheets]
    .reverse()
    .filter((sheet) => counts.has(sheet.id))
    .map((sheet) => ({ year: sheet.name, count: counts.get(sheet.id)! }))

  const yearlyTopBooks = await readHighlights(prisma, {
    userId,
    orderBy: { collection: { name: 'desc' } },
  })
  return {
    props: {
      total: books.length,
      books: booksData,
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
      yearlyTopBooks: yearlyTopBooks.map((entry) => ({
        ...entry,
        book: {
          ...entry.book,
          memo: entry.book.isPublicMemo ? mask(entry.book.memo) : '',
        },
      })),
    },
    revalidate: 5,
  }
}

export async function getStaticPaths() {
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
    fallback: 'blocking', // キャッシュが存在しない場合はSSR
  }
}
