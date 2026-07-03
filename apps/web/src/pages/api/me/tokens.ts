import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { createHash, randomBytes } from 'crypto'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import prisma from '@/libs/prisma'

const MAX_TOKENS_PER_USER = 5
const TOKEN_PREFIX = 'kidoku_pat_'

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

// パーソナルアクセストークンの管理API（本人専用）
// GET: 一覧 / POST: 作成(平文トークンは作成時のみ返す) / DELETE: 削除
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const userId = session.user.id

  try {
    if (req.method === 'GET') {
      const tokens = await prisma.personalAccessToken.findMany({
        where: { userId },
        orderBy: { created: 'asc' },
        select: { id: true, name: true, lastUsedAt: true, created: true },
      })
      res.setHeader('Cache-Control', 'private, no-store')
      return res.status(200).json({ tokens })
    }

    if (req.method === 'POST') {
      const { name } = req.body as { name?: string }
      if (!name?.trim()) {
        return res.status(400).json({ error: 'トークン名を入力してください' })
      }
      const count = await prisma.personalAccessToken.count({
        where: { userId },
      })
      if (count >= MAX_TOKENS_PER_USER) {
        return res.status(400).json({
          error: `トークンは${MAX_TOKENS_PER_USER}個まで作成できます`,
        })
      }
      const token = `${TOKEN_PREFIX}${randomBytes(32).toString('hex')}`
      const created = await prisma.personalAccessToken.create({
        data: {
          userId,
          name: name.trim().slice(0, 60),
          tokenHash: hashToken(token),
        },
      })
      // 平文トークンはこのレスポンスでのみ返す（保存しない）
      return res.status(200).json({
        id: created.id,
        name: created.name,
        token,
      })
    }

    if (req.method === 'DELETE') {
      const id = Number(req.query.id)
      if (!Number.isInteger(id)) {
        return res.status(400).json({ error: 'IDが不正です' })
      }
      await prisma.personalAccessToken.deleteMany({
        where: { id, userId },
      })
      return res.status(200).json({ result: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('tokens error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
