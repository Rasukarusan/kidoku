import prisma from '@/libs/prisma/edge'
import { RequestCookies } from '@edge-runtime/cookies'

const revalidatePath = async (username: string, sheetName: string) => {
  const path = `/${username}/sheets/${sheetName}`
  try {
    await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, secret: process.env.REVALIDATE_SECRET }),
    })
  } catch (e) {
    console.error('Revalidate error:', e)
  }
}

export const handleDelete = async (req: Request) => {
  try {
    const cookies = new RequestCookies(req.headers)
    const sessionToken = cookies.get('next-auth.session-token')?.value
    const url = new URL(req.url)
    const sheetName = url.searchParams.get('sheetName')
    const userId = url.searchParams.get('userId')

    const session = await prisma.session.findFirst({
      where: { sessionToken },
    })
    if (!session || session?.userId !== userId) {
      return new Response(
        JSON.stringify({ result: false, error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    })
    if (!user) {
      return new Response(
        JSON.stringify({ result: false, error: 'User not found' }),
        { status: 404 }
      )
    }

    const sheet = await prisma.sheets.findFirst({
      where: { userId, name: sheetName },
      select: { id: true },
    })
    if (!sheet) {
      return new Response(
        JSON.stringify({ result: false, error: 'Sheet not found' }),
        { status: 404 }
      )
    }

    const deleted = await prisma.aiSummaries.deleteMany({
      where: {
        userId,
        sheet_id: sheet.id,
      },
    })

    await revalidatePath(user.name, sheetName)

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
