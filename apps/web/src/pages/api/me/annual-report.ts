import { readSheets, readBooks } from '@kidoku/reading-store'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import prisma from '@/libs/prisma'

// 年間レポート用のデータを返す（本人専用）
// sheet(年)を指定しない場合はシート一覧のみ返す
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
    const userId = session.user.id
    const sheets = await readSheets(prisma, {
      where: { userId },
      orderBy: { position: 'asc' },
    })

    const sheetName = req.query.sheet as string | undefined
    const sheet = sheetName
      ? sheets.find((s) => s.name === sheetName)
      : sheets[sheets.length - 1]

    if (!sheet) {
      res.setHeader('Cache-Control', 'private, no-store')
      return res.status(200).json({
        sheets: sheets.map(({ id, name }) => ({ id, name })),
        report: null,
      })
    }

    const books = await readBooks(prisma, {
      filter: { userId, sheetId: sheet.id },
      orderBy: { finished: 'asc' },
    })

    res.setHeader('Cache-Control', 'private, no-store')
    return res.status(200).json({
      sheets: sheets.map(({ id, name }) => ({ id, name })),
      report: {
        sheetName: sheet.name,
        books: books.map((book) => ({
          id: book.id,
          title: book.title,
          author: book.author,
          category: book.category,
          image: book.image,
          impression: book.impression,
          finished: book.finished?.toISOString() ?? null,
          memoLength: book.memo?.length ?? 0,
        })),
      },
    })
  } catch (error) {
    console.error('annual-report error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
