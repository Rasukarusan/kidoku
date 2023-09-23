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
    const month = book.finished
      ? dayjs(book.finished).format('M') + '月'
      : dayjs().format('M') + '月' // まだ読み終わっていない場合は今月とする
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
    const memo = is_public_memo ? book.memo : ''
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
      username,
    },
    revalidate: 300,
  }
}
export async function getStaticPaths() {
  return {
    paths: [
      { params: { user: 'Rasukarusan', year: '2023' } },
      { params: { user: 'Rasukarusan', year: '2022' } },
    ],
    fallback: 'blocking', // キャッシュが存在しない場合はSSR
  }
}
