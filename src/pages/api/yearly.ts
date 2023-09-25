import prisma from '@/libs/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'

export default async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(200).json({ result: false })
    }
    const userId = session.user.id
    const body = JSON.parse(req.body)
    const { year, order, bookId } = body
    const result = await prisma.yearlyTopBook.upsert({
      create: {
        year,
        order,
        user: { connect: { id: userId } },
        book: { connect: { id: bookId } },
      },
      update: { book: { connect: { id: bookId } } },
      where: {
        userId_order_year: {
          year,
          order,
          userId,
        },
      },
    })
    return res.status(200).json({ result: true })
  } catch (e) {
    console.error(e)
    res.status(400).json({ result: false })
  }
}
