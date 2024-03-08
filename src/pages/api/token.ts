import prisma from '@/libs/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'
import { aiSummaryPrompt as prompt } from '@/libs/openai/prompt'
import { getToken } from '@/libs/openai/token'
import dayjs from 'dayjs'
import { setTimeout } from 'timers/promises'

export default async (req, res) => {
  await setTimeout(2000)

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ result: false })
    }
    const { sheetName, isTotal } = req.query
    const isTotalSheet = isTotal === '1' && sheetName === 'total'
    const userId = session.user.id
    const sheet = isTotalSheet
      ? { id: 0, name: 'total' }
      : await prisma.sheets.findFirst({
          where: { userId, name: sheetName },
          select: { id: true, name: true },
        })

    if (!sheet || sheet.name !== sheetName) {
      return res.status(401).json({ result: false })
    }
    // 分析対象のメモを取得
    const books = isTotalSheet
      ? await prisma.books.findMany({
          where: { userId, is_public_memo: true },
          select: {
            category: true,
            memo: true,
          },
        })
      : await prisma.books.findMany({
          where: { userId, is_public_memo: true, sheet: { name: sheetName } },
          select: {
            category: true,
            memo: true,
          },
          // take: 10,
        })
    // 分析に必要なトークン数を取得
    const token = await getToken(prompt + JSON.stringify(books))

    // 今月使用したトークン数を取得
    const start = dayjs().startOf('month').toDate()
    const end = dayjs().endOf('month').toDate()
    console.log(start, end)
    const aiSummaries = await prisma.aiSummaries.findMany({
      where: {
        userId,
        sheet_id: sheet.id,
        created: {
          gte: start,
          lt: end,
        },
      },
      select: { token: true },
    })
    const used_token = aiSummaries.reduce(
      (sum, aiSummary) => sum + aiSummary.token,
      0
    )
    return res
      .status(200)
      .json({ result: true, token: token.token, used_token })
  } catch (e) {
    console.error(e)
    return res.status(400).json({ result: false })
  }
}
