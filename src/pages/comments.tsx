import { CommentsPage } from '@/features/comments/components/CommentsPage'
import prisma, { parse } from '@/libs/prisma'

export default CommentsPage

export async function getServerSideProps(ctx) {
  const page = parseInt(ctx.query.page) || 1
  const limit = 20
  const [total, books] = await Promise.all([
    await prisma.books.count({
      where: { is_public_memo: true },
    }),
    await prisma.books.findMany({
      include: {
        user: { select: { name: true, image: true } },
        sheet: {
          select: { name: true },
        },
      },
      where: { is_public_memo: true },
      orderBy: [{ updated: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])
  const comments = []
  parse(books).map((book) => {
    comments.push({
      id: book.id,
      title: book.title,
      memo: book.memo,
      updated: book.updated,
      image: book.image,
      username: book.user.name,
      userImage: book.user.image,
    })
  })
  const next = Math.ceil(total / limit) > page
  return {
    props: { comments, next, page },
  }
}
