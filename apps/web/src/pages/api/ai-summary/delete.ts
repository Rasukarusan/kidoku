import prisma from '@/libs/prisma/edge'
import { RequestCookies } from '@edge-runtime/cookies'

export const runtime = 'edge'

export default async (req: Request) => {
  if (req.method !== 'DELETE') {
    return new Response(JSON.stringify({ result: false, error: 'Method not allowed' }), {
      status: 405,
    })
  }

  try {
    const cookies = new RequestCookies(req.headers)
    const sessionToken = cookies.get('next-auth.session-token')?.value
    const body = await req.json()
    const { sheetName, userId } = body

    // 認証チェック
    const session = await prisma.session.findFirst({
      where: { sessionToken },
    })
    if (!session || session?.userId !== userId) {
      return new Response(JSON.stringify({ result: false, error: 'Unauthorized' }), {
        status: 401,
      })
    }

    // シート取得
    const sheet = await prisma.sheets.findFirst({
      where: { userId, name: sheetName },
      select: { id: true },
    })
    if (!sheet) {
      return new Response(JSON.stringify({ result: false, error: 'Sheet not found' }), {
        status: 404,
      })
    }

    // AI分析結果を削除
    const deleted = await prisma.aiSummaries.deleteMany({
      where: {
        userId,
        sheet_id: sheet.id,
      },
    })

    return new Response(JSON.stringify({ result: true, deletedCount: deleted.count }), {
      status: 200,
    })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ result: false, error: 'Internal server error' }), {
      status: 500,
    })
  }
}
