import { IndexPage } from '@/features/index/components/IndexPage'
export default IndexPage

import prisma, { parse } from '@/libs/prisma'
import { mask } from '@/utils/string'
import { isSSGEnabled } from '@/libs/env'

const fetchIndexData = async () => {
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

// 本番環境: SSG (ISR)
export const getStaticProps = isSSGEnabled
  ? async () => ({ ...(await fetchIndexData()), revalidate: 5 })
  : undefined

// 開発・プレビュー環境: SSR
export const getServerSideProps = !isSSGEnabled
  ? async () => await fetchIndexData()
  : undefined
