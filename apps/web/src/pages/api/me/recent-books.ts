import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import prisma from '@/libs/prisma'

// ログインユーザー自身が最近登録した本を返す（本人専用）
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
      where: { userId: session.user.id },
      include: { sheet: { select: { name: true } } },
      orderBy: { created: 'desc' },
      take: 6,
    })

    res.setHeader('Cache-Control', 'private, no-store')
    return res.status(200).json({
      books: books.map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        image: book.image,
        sheet: book.sheet.name,
        created: book.created.toISOString(),
      })),
    })
  } catch (error) {
    console.error('recent-books error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
