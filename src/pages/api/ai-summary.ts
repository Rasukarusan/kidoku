import prisma from '@/libs/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'
import { chat } from '@/libs/openai/gpt'
import { aiSummaryPrompt as prompt } from '@/libs/openai/prompt'
import { getToken } from '@/libs/openai/token'
import dayjs from 'dayjs'

export default async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ result: false })
    }
    const body = JSON.parse(req.body)
    const { sheetName, months, categories } = body

    const userId = session.user.id
    const sheet = await prisma.sheets.findFirst({
      where: { userId, name: sheetName },
      select: { id: true, name: true },
    })
    if (!sheet) {
      return res.status(401).json({ result: false })
    }
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
      take: 10,
    })
    const targetBooks = books.filter((book) => {
      const month = dayjs(book.finished).month() + 1
      if (months.includes(month) && categories.includes(book.category)) {
        return book
      }
    })

    const token = await getToken(prompt + JSON.stringify(targetBooks))
    console.log(token)
    // return res.status(200).json({ result: true })
    const result = await chat(JSON.stringify(targetBooks))
    const json = JSON.parse(result.choices[0].message.content)
    const {
      reading_trend_analysis,
      sentiment_analysis,
      what_if_scenario,
      overall_feedback,
    } = json
    await prisma.aiSummaries.create({
      data: {
        userId,
        sheet_id: sheet.id,
        analysis: {
          reading_trend_analysis,
          sentiment_analysis,
          what_if_scenario,
          overall_feedback,
        },
        token: token.token,
      },
    })
    return res.status(200).json({ result: true, data: json })
  } catch (e) {
    console.error(e)
    return res.status(400).json({ result: false })
  }
}
