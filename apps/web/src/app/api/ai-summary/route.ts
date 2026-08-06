import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { graphqlClient } from '@/libs/graphql/backend-client'

/**
 * AI読書分析の生成プロキシ。
 * 認証セッションをHMAC署名付きヘッダーに変換してバックエンド
 * (NestJS: POST /ai-summary/generate)へ転送し、ストリーミングレスポンスを中継する。
 *
 * Pages RouterのAPI Routeはレスポンスを最後までバッファしてから返すため、
 * 生成の逐次表示ができない。ストリームをそのまま流せるRoute Handlerで実装している。
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// Vercel Hobbyプランの上限
export const maxDuration = 60

export async function POST(request: Request): Promise<Response> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ result: false }, { status: 401 })
  }

  try {
    const { sheetName, months, categories } = await request.json()
    if (!sheetName || !Array.isArray(months) || !Array.isArray(categories)) {
      return Response.json({ result: false }, { status: 400 })
    }

    const response = await graphqlClient.fetchRest(
      session.user.id,
      '/ai-summary/generate',
      { sheetName, months, categories },
      session.user.admin || false
    )

    if (!response.ok || !response.body) {
      console.error('AI summary generation failed:', response.status)
      return Response.json(
        { result: false },
        { status: response.status || 500 }
      )
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        // プロキシによるバッファリングを抑止する
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    console.error('AI summary proxy error:', error)
    return Response.json({ result: false }, { status: 500 })
  }
}
