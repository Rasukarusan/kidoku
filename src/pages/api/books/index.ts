import prisma from '@/libs/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'

export default async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      res.status(401).json({ result: false })
    }
    const body = JSON.parse(req.body)
    const id = body.id
    const userId = session.user.id
    const book = await prisma.books.findUnique({
      where: { id, userId },
    })
    if (!book) {
      res.status(401).json({ result: false })
    }
    const { title, author, category, image, impression, memo, is_public_memo } =
      body
    const success = await prisma.books.update({
      where: { id, userId },
      data: {
        title,
        author,
        category,
        image,
        impression,
        memo,
        is_public_memo,
      },
    })
    res.status(200).json({ result: true })
  } catch (e) {
    console.error(e)
    res.status(400).json({ result: false })
  }
}
