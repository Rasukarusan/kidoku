import { readBooks } from '@kidoku/reading-store'
import { IndexPage } from '@/features/index/components/IndexPage'
export default IndexPage

import prisma, { parse } from '@/libs/prisma'
import { mask } from '@/utils/string'
import { mcpUrls } from '@/libs/mcp/oauth'

export const getStaticProps = async () => {
  const books = await readBooks(prisma, {
    filter: { isPublicMemo: true },
    orderBy: [{ updated: 'desc' }],
    limit: 10,
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
  return {
    props: { comments, mcpEndpoint: mcpUrls().resource },
    revalidate: 5,
  }
}
