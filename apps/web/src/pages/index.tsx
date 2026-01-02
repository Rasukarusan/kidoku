import { IndexPage } from '@/features/index/components/IndexPage'
export default IndexPage

import prisma, { parse } from '@/libs/prisma'
import { mask } from '@/utils/string'
import { isSSGEnabled } from '@/libs/env'
import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // 本番環境のみキャッシュを有効化（ISR相当の動作）
  if (isSSGEnabled) {
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=5, stale-while-revalidate=59'
    )
  }

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
  return { props: { comments } }
}
