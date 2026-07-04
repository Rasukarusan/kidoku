import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import prisma from '@/libs/prisma'

// ログインユーザーの全シートのAI分析履歴を返す（本人専用）
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
    const [summaries, sheets] = await Promise.all([
      prisma.aiSummaries.findMany({
        where: { userId },
        orderBy: { created: 'asc' },
      }),
      prisma.sheets.findMany({
        where: { userId },
        orderBy: { order: 'asc' },
      }),
    ])
    const sheetById = new Map(sheets.map((s) => [s.id, s]))

    res.setHeader('Cache-Control', 'private, no-store')
    return res.status(200).json({
      summaries: summaries
        .filter((summary) => sheetById.has(summary.sheetId))
        .map((summary) => {
          const sheet = sheetById.get(summary.sheetId)
          return {
            id: summary.id,
            sheetId: summary.sheetId,
            sheetName: sheet?.name ?? '',
            sheetOrder: sheet?.order ?? 0,
            analysis:
              typeof summary.analysis === 'string'
                ? JSON.parse(summary.analysis)
                : summary.analysis,
            created: summary.created?.toISOString() ?? null,
          }
        }),
    })
  } catch (error) {
    console.error('ai-summary-history error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
