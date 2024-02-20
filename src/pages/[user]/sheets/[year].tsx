import prisma, { parse } from '@/libs/prisma'
import dayjs from 'dayjs'
import { SheetPage } from '@/features/sheet/components/SheetPage'
export default SheetPage

type Props = { params: { year: string } }
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
    const memo = book.is_public_memo ? book.memo : ''
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

  const aiSummary = await prisma.aiSummaries.findFirst({
    where: { userId, sheet_id: sheet.id },
    select: { analysis: true },
  })
  const analysis = aiSummary ? parse(aiSummary.analysis) : null
  return {
    props: {
      data: parse(data),
      year,
      sheets: sheets.map((sheet) => sheet.name),
      username,
      yearlyTopBooks,
      aiSummary: analysis,
    },
    revalidate: 300,
  }
}
export async function getStaticPaths() {
  const users = await prisma.user.findMany({
    select: { name: true, sheets: { select: { name: true } } },
  })
  const paths = users
    .map((user) => {
      return user.sheets.map((sheet) => {
        return { params: { user: user.name, year: sheet.name } }
      })
    })
    .flat()
  return {
    paths,
    fallback: 'blocking', // キャッシュが存在しない場合はSSR
  }
}
