import prisma from '@/libs/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'
import { aiSummaryPrompt as prompt } from '@/libs/ai/prompt'
import { getToken } from '@/libs/ai/token'
import dayjs from 'dayjs'
import { uniq } from '@/utils/array'

export default async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ result: false })
    }
    const { sheetName, months, categories } = req.query
    const userId = session.user.id
    const sheet = await prisma.sheets.findFirst({
      where: { userId, name: sheetName },
      select: { id: true, name: true },
    })

    if (!sheet || sheet.name !== sheetName) {
      return res.status(401).json({ result: false })
    }
    // 分析対象のメモを取得
    const books = await prisma.books.findMany({
      where: {
        userId,
        is_public_memo: true,
        sheet: { id: sheet.id },
        NOT: { finished: null },
      },
      select: {
        category: true,
        memo: true,
        finished: true,
      },
    })
    const targetMonths = months
      ? months.split(',')
      : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
    const targetCategories = categories
      ? categories.split(',')
      : uniq(books.map((book) => book.category))
    const targetBooks = books.filter((book) => {
      const month = dayjs(book.finished).month() + 1
      if (
        targetMonths.includes(`${month}`) &&
        targetCategories.includes(book.category)
      ) {
        return book
      }
    })

    // 分析に必要なトークン数を取得
    const token = await getToken(prompt + JSON.stringify(targetBooks))

    // 今月使用したトークン数を取得
    const start = dayjs().startOf('month').toDate()
    const end = dayjs().endOf('month').toDate()
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
