import prisma from '@/libs/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import dayjs from 'dayjs'
import { getServerSession } from 'next-auth/next'

export default async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(200).json({ result: false, book: undefined })
    }
    const userId = session.user.id
    const book = await prisma.books.findFirst({
      where: { userId, id: Number(req.query.bookId) },
    })
    const month = book.finished
      ? dayjs(book.finished).format('M') + '月'
      : dayjs().format('M') + '月' // まだ読み終わっていない場合は今月とする
    return res.status(200).json({ result: true, book: { ...book, month } })
  } catch (e) {
    console.error(e)
    return res.status(400).json({ result: false })
  }
}