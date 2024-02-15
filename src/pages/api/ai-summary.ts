import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'
import prisma from '@/libs/prisma'
import { chat } from '@/libs/openai/gpt'
// import { isAdmin } from '@/utils/api'
// import prisma from '@/libs/prisma/edge'

export default async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      res.status(401).json({ result: false })
    }
    const body = JSON.parse(req.body)
    const { sheetName } = body
    const userId = session.user.id
    const books = await prisma.books.findMany({
      where: { is_public_memo: true, sheet: { name: sheetName } },
      select: {
        category: true,
        memo: true,
      },
      take: 1,
    })
    const sheet = await prisma.sheets.findFirst({
      where: { userId, name: sheetName },
      select: { id: true },
    })
    const result = await chat(JSON.stringify(books))
    const json = JSON.parse(result.choices[0].message.content)
    const {
      reading_trend_analysis,
      sentiment_analysis,
      what_if_scenario,
      overall_feedback,
    } = json
    await prisma.userReadingAnalysis.create({
      data: {
        userId,
        sheet_id: sheet.id,
        reading_trend_analysis,
        sentiment_analysis,
        what_if_scenario,
        overall_feedback,
      },
    })
    res.status(200).json({ result: true, data: json })
  } catch (e) {
    console.error(e)
    res.status(400).json({ result: false })
  }
}
