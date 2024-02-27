import prisma from '@/libs/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
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
    return res.status(200).json({ result: true, book })
  } catch (e) {
    console.error(e)
    res.status(400).json({ result: false })
  }
}
