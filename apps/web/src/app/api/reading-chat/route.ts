import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { graphqlClient } from '@/libs/graphql/backend-client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: Request): Promise<Response> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  const { question } = (await request.json()) as { question?: unknown }
  if (typeof question !== 'string' || !question.trim()) {
    return Response.json({ error: '質問を入力してください' }, { status: 400 })
  }

  try {
    const response = await graphqlClient.fetchRest(
      session.user.id,
      '/reading-chat',
      { question: question.trim() },
      session.user.admin || false
    )
    const body = await response.text()
    return new Response(body, {
      status: response.status,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  } catch (error) {
    console.error('Reading chat proxy error:', error)
    return Response.json(
      { error: '回答を生成できませんでした' },
      { status: 500 }
    )
  }
}
