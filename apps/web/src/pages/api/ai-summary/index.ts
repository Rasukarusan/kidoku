import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { graphqlClient } from '@/libs/graphql/backend-client'

/**
 * AI読書分析の生成プロキシ。
 * 認証セッションをHMAC署名付きヘッダーに変換してバックエンド
 * (NestJS: POST /ai-summary/generate)へ転送し、
 * ストリーミングレスポンスをそのまま中継する。
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ result: false, error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return res.status(401).json({ result: false })
  }

  try {
    const { sheetName, months, categories } =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    if (!sheetName || !Array.isArray(months) || !Array.isArray(categories)) {
      return res.status(400).json({ result: false })
    }

    const response = await graphqlClient.fetchRest(
      session.user.id,
      '/ai-summary/generate',
      { sheetName, months, categories },
      session.user.admin || false
    )

    if (!response.ok || !response.body) {
      console.error('AI summary generation failed:', response.status)
      return res.status(response.status || 500).json({ result: false })
    }

    res.status(200)
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-transform')

    const reader = response.body.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) res.write(value)
    }
    res.end()
  } catch (error) {
    console.error('AI summary proxy error:', error)
    if (!res.headersSent) {
      return res.status(500).json({ result: false })
    }
    res.end()
  }
}

export const config = {
  maxDuration: 300,
}
