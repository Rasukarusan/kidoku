import prisma from '@/libs/prisma/edge'
import { RequestCookies } from '@edge-runtime/cookies'

export const handleDelete = async (req: Request) => {
  try {
    const cookies = new RequestCookies(req.headers)
    const sessionToken = cookies.get('next-auth.session-token')?.value
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const userId = url.searchParams.get('userId')

    if (!id) {
      return new Response(
        JSON.stringify({ result: false, error: 'ID is required' }),
        { status: 400 }
      )
    }

    const session = await prisma.session.findFirst({
      where: { sessionToken },
    })
    if (!session || session?.userId !== userId) {
      return new Response(
        JSON.stringify({ result: false, error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    // 削除対象が自分のものか確認してから削除
    const deleted = await prisma.aiSummaries.deleteMany({
      where: {
        id: parseInt(id, 10),
        userId,
      },
    })

    return new Response(
      JSON.stringify({ result: true, deletedCount: deleted.count }),
      { status: 200 }
    )
  } catch (e) {
    console.error(e)
    return new Response(
      JSON.stringify({ result: false, error: 'Internal server error' }),
      { status: 500 }
    )
  }
}
