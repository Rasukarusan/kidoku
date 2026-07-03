import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import prisma from '@/libs/prisma'

// 「◯年前の今日」読み終えた本を返す（本人専用）
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const books = await prisma.books.findMany({
      where: { userId: session.user.id, finished: { not: null } },
      select: {
        id: true,
        title: true,
        author: true,
        image: true,
        memo: true,
        finished: true,
      },
      orderBy: { finished: 'desc' },
    })

    const today = new Date()
    const matches = books
      .filter((book) => {
        const finished = book.finished
        if (!finished) return false
        const yearsAgo = today.getFullYear() - finished.getFullYear()
        return (
          yearsAgo >= 1 &&
          finished.getMonth() === today.getMonth() &&
          finished.getDate() === today.getDate()
        )
      })
      .map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        image: book.image,
        yearsAgo: today.getFullYear() - (book.finished as Date).getFullYear(),
      }))

    res.setHeader('Cache-Control', 'private, no-store')
    return res.status(200).json({ books: matches })
  } catch (error) {
    console.error('on-this-day error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
