import { IndexPage } from '@/features/index/components/IndexPage'
export default IndexPage

import prisma, { parse } from '@/libs/prisma'
import { mask } from '@/utils/string'

export const getStaticProps = async (ctx) => {
  const books = await prisma.books.findMany({
    include: {
      user: { select: { name: true, image: true } },
      sheet: {
        select: { name: true },
      },
    },
    where: { is_public_memo: true },
    orderBy: [{ updated: 'desc' }],
    take: 10,
  })
  const comments = []
  parse(books).map((book) => {
    comments.push({
      id: book.id,
      title: book.title,
      memo: mask(book.memo),
      updated: book.updated,
      image: book.image,
      username: book.user.name,
      userImage: book.user.image,
      sheet: book.sheet.name,
    })
  })
  const result = []
  return {
    props: { comments },
    revalidate: 300,
  }
}
