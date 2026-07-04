import { NextApiRequest, NextApiResponse } from 'next'
import { createHash } from 'crypto'
import prisma from '@/libs/prisma'

// 個人用REST API v1: 自分の読書記録を取得する（読み取り専用）
//
// 認証: パーソナルアクセストークン（設定 > 個人用API で発行）
//   curl -H "Authorization: Bearer kidoku_pat_xxx" https://kidoku.net/api/v1/books
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Authorization: Bearer <token> ヘッダーが必要です' })
  }
  const token = auth.slice('Bearer '.length).trim()
  const tokenHash = createHash('sha256').update(token).digest('hex')

  try {
    const pat = await prisma.personalAccessToken.findUnique({
      where: { tokenHash },
    })
    if (!pat) {
      return res.status(401).json({ error: 'トークンが無効です' })
    }

    await prisma.personalAccessToken.update({
      where: { id: pat.id },
      data: { lastUsedAt: new Date() },
    })

    const sheets = await prisma.sheets.findMany({
      where: { userId: pat.userId },
      include: {
        books: {
          orderBy: { finished: 'desc' },
        },
      },
      orderBy: { order: 'asc' },
    })

    res.setHeader('Cache-Control', 'private, no-store')
    return res.status(200).json({
      sheets: sheets.map((sheet) => ({
        name: sheet.name,
        books: sheet.books.map((book) => ({
          id: book.id,
          title: book.title,
          author: book.author,
          category: book.category,
          impression: book.impression,
          memo: book.memo,
          finished: book.finished?.toISOString() ?? null,
          created: book.created.toISOString(),
          updated: book.updated.toISOString(),
        })),
      })),
    })
  } catch (error) {
    console.error('v1/books error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
