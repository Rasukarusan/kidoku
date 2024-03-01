import prisma from '@/libs/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import dayjs from 'dayjs'
import { getServerSession } from 'next-auth/next'

export default async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(200).json({ result: false, books: [] })
    }
    const userId = session.user.id
    const books = await prisma.books.findMany({
      where: { userId, sheet: { name: req.query.sheet } },
      include: { sheet: { select: { name: true } } },
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
        memo,
        finished,
        is_public_memo,
      } = book
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
        finished,
        is_public_memo,
      }
    })
    return res.status(200).json({
      result: true,
      books: data,
    })
  } catch (e) {
    console.error(e)
    return res.status(400).json({ result: false })
  }
}
