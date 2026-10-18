import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import prisma from '@/libs/prisma'
import { mcpUrls } from '@/libs/mcp/oauth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'private, no-store')
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id)
      return res.status(401).json({ error: 'Unauthorized' })
    if (req.method === 'GET') {
      const connections = await prisma.mcpGrant.findMany({
        where: {
          userId: session.user.id,
          tokenHash: { not: null },
          expiresAt: { gt: new Date() },
        },
        select: {
          id: true,
          client: { select: { name: true } },
          expiresAt: true,
        },
      })
      return res.json({ connections })
    }
    if (req.method === 'DELETE') {
      if (req.headers.origin !== mcpUrls().issuer)
        return res.status(403).json({ error: 'Forbidden' })
      if (typeof req.query.id !== 'string')
        return res.status(400).json({ error: 'IDが必要です' })
      await prisma.mcpGrant.deleteMany({
        where: { id: req.query.id, userId: session.user.id },
      })
      return res.json({ result: true })
    }
    res.setHeader('Allow', 'GET, DELETE')
    return res.status(405).end()
  } catch {
    return res.status(500).json({ error: '接続を取得・解除できませんでした' })
  }
}
