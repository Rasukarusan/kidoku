import prisma, { parse } from '@/libs/prisma'
import dayjs from 'dayjs'
import { SheetPage } from '@/features/sheet/components/SheetPage'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth'
export default SheetPage

type Props = { params: { year: string } }
export async function getServerSideProps(context) {
  const { user: username, year } = context.params
  const user = await prisma.user.findUnique({
    where: { name: username },
  })
  if (!user) {
    return {
      notFound: true,
    }
  }
  const session = await getServerSession(context.req, context.res, authOptions)
  const isMine = session?.user?.id === user.id
  const userId = user.id
  const sheets = await prisma.sheets.findMany({
    where: { userId },
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
  })
  const data = books.map((book) => {
    const month = dayjs(book.finished).format('M') + '月'
    const {
      id,
      userId,
      title,
      author,
      category,
      image,
      impression,
      is_public_memo,
    } = book
    const memo = isMine || is_public_memo ? book.memo : ''
    return {
      id,
      userId,
      month,
      title,
      author,
      category,
      image,
      impression,
      memo,
      is_public_memo,
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
