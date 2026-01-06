import prisma, { parse } from '@/libs/prisma'
import dayjs from 'dayjs'
import { SheetPage } from '@/features/sheet/components/SheetPage'
import { mask } from '@/utils/string'
import { GetServerSideProps } from 'next'

export default SheetPage

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const username = params?.user as string
  const year = params?.year as string
  const user = await prisma.user.findUnique({
    where: { name: username },
  })
  if (!user) {
    return {
      notFound: true,
    }
  }
  const userId = user.id
  const sheets = await prisma.sheets.findMany({
    where: { userId },
    orderBy: [{ order: 'desc' }],
  })
  const sheet = sheets.find((sheet) => sheet.name === year)
  if (!sheet) {
    return {
      notFound: true,
    }
  }
  const books = await prisma.books.findMany({
    where: {
      sheet_id: sheet.id,
      userId,
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
      created: false,
      updated: false,
    },
  })
  const data = books.map((book) => {
    const month = book.finished
      ? dayjs(book.finished).format('M') + '月'
      : dayjs().format('M') + '月' // まだ読み終わっていない場合は今月とする
    const memo = book.is_public_memo ? mask(book.memo) : ''
    return {
      ...book,
      month,
      memo,
    }
  })
  const yearlyTopBooks = await prisma.yearlyTopBook.findMany({
    where: { year, user: { name: username } },
    select: {
      year: true,
      order: true,
      book: { select: { id: true, title: true, author: true, image: true } },
    },
    orderBy: { order: 'asc' },
  })

  const aiSummaries = await prisma.aiSummaries.findMany({
    where: { userId, sheet_id: sheet.id },
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
      yearlyTopBooks,
      aiSummaries: aiSummaries.map((v) => ({
        id: v.id,
        ...(v.analysis as object),
      })),
    },
  }
}
