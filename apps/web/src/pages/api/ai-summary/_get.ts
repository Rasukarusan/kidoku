import { migrateAnalysis } from '@/features/sheet/components/AiSummaries/migrator'
import prisma from '@/libs/prisma/edge'
import { RequestCookies } from '@edge-runtime/cookies'

export const handleGet = async (req: Request) => {
  const cookies = new RequestCookies(req.headers)
  const sessionToken = cookies.get('next-auth.session-token')?.value
  const sheetName = new URL(req.url).searchParams.get('sheetName')

  if (!sessionToken || !sheetName) {
    return new Response(JSON.stringify({ result: false }), { status: 400 })
  }

  const session = await prisma.session.findFirst({
    where: { sessionToken },
    select: { userId: true },
  })
  if (!session) {
    return new Response(JSON.stringify({ result: false }), { status: 401 })
  }

  const sheet = await prisma.sheets.findFirst({
    where: { userId: session.userId, name: sheetName },
    select: { id: true },
  })
  if (!sheet) {
    return new Response(JSON.stringify({ result: false }), { status: 404 })
  }

  const summaries = await prisma.aiSummaries.findMany({
    where: { userId: session.userId, sheetId: sheet.id },
    select: { id: true, analysis: true },
    orderBy: { created: 'desc' },
  })

  return Response.json({
    summaries: summaries.map(({ id, analysis }) => ({
      id,
      ...migrateAnalysis(
        typeof analysis === 'string' ? JSON.parse(analysis) : analysis
      ),
    })),
  })
}
