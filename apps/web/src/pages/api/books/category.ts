import prisma from '@/libs/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'

export default async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(200).json({ result: false, books: [] })
    }
    const userId = session.user.id
    const result = await prisma.books.groupBy({
      by: ['category'],
      where: { userId },
      orderBy: [{ category: 'asc' }],
    })
    const categories = result.map((v) => v.category)
    return res.status(200).json({
      result: true,
      categories,
    })
  } catch (e) {
    console.error(e)
    return res.status(400).json({ result: false })
  }
}
