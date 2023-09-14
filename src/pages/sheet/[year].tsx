import prisma, { parse } from '@/libs/prisma'
import dayjs from 'dayjs'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'
import { SheetPage } from '@/features/sheet/components/SheetPage'
export default SheetPage

type Props = { params: { year: string } }
export async function getServerSideProps(context) {
  const { year } = context.params
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session) {
    return {
      props: {
        data: [],
        year,
      },
    }
  }
  const userId = session.user.id
  const sheets = await prisma.sheets.findMany({
    where: { userId },
  })
  const sheet = sheets.find((sheet) => sheet.name === year)
  if (!sheet) {
    return {
      props: {
        data: [],
        year,
      },
    }
  }
  const books = await prisma.books.findMany({
    where: {
      sheet_id: sheet.id,
      userId,
    },
  })
  const data = books.map((book) => {
    const month = dayjs(book.finished).format('M') + '月'
    const { title, author, category, image, impression, memo } = book
    return {
      month,
      title,
      author,
      category,
      image,
      impression,
      memo,
    }
  })
  return {
    props: {
      data: parse(data),
      year,
      sheets: sheets.map((sheet) => sheet.name),
    },
  }
}
