import { NextApiRequest, NextApiResponse } from 'next'
import { createHash } from 'crypto'
import prisma from '@/libs/prisma'
import { parsePagination } from '@/utils/pagination'

// 個人用REST API v1: 自分の読書記録を取得する（読み取り専用）
//
// 認証: パーソナルアクセストークン（設定 > 個人用API で発行）
//   curl -H "Authorization: Bearer kidoku_pat_xxx" https://kidoku.net/api/v1/books
//
// クエリパラメータ:
//   page:    ページ番号（1始まり、デフォルト1）
//   perPage: 1ページあたりの件数（デフォルト100、最大200）
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

  const pagination = parsePagination(req.query)
  if ('error' in pagination) {
    return res.status(400).json({ error: pagination.error })
  }
  const { page, perPage } = pagination

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

    const where = { userId: pat.userId }
    const [total, books] = await prisma.$transaction([
      prisma.books.count({ where }),
      prisma.books.findMany({
        where,
        include: { sheet: { select: { name: true } } },
        // MySQLではDESCでNULL(未読了)が末尾に並ぶ。idは同日読了時の順序安定用
        orderBy: [{ finished: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ])

    res.setHeader('Cache-Control', 'private, no-store')
    return res.status(200).json({
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
      books: books.map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        category: book.category,
        impression: book.impression,
        memo: book.memo,
        sheet: book.sheet.name,
        finished: book.finished?.toISOString() ?? null,
        created: book.created.toISOString(),
        updated: book.updated.toISOString(),
      })),
    })
  } catch (error) {
    console.error('v1/books error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
