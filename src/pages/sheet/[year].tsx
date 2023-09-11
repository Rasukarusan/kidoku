import { SheetPage } from '@/features/sheet/components/SheetPage'
import { getYears } from '@/features/sheet/util'
import prisma, { parse } from '@/libs/prisma'
import dayjs from 'dayjs'
export default SheetPage

type Props = { params: { year: number } }
export const getStaticProps = async ({ params }: Props) => {
  const books = await prisma.books.findMany()
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
      year: params.year.toString(),
    },
  }
}

export const getStaticPaths = async () => {
  const years = getYears()
  const paths = years.map((year) => {
    return { params: { year } }
  })
  return {
    paths,
    fallback: false,
  }
}
