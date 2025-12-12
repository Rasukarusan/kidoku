import prisma from '@/libs/prisma/edge'
import dayjs from 'dayjs'
import { aiSummaryPrompt } from '@/libs/ai/prompt'
import cohere from '@/libs/ai/cohere'
import { RequestCookies } from '@edge-runtime/cookies'
import { metricsHelpers } from '@/lib/metrics'

export const runtime = 'edge'

export default async (req) => {
  try {
    const cookies = new RequestCookies(req.headers)
    const sessionToken = cookies.get('next-auth.session-token')?.value
    const body = await req.json()
    console.log(body)
    const { sheetName, months, categories, userId } = body
    const user = await prisma.session.findFirst({
      where: { sessionToken },
    })
    if (!user || user?.userId !== userId) {
      return new Response(JSON.stringify({ result: false }))
    }

    const sheet = await prisma.sheets.findFirst({
      where: { userId, name: sheetName },
      select: { id: true, name: true },
    })
    if (!sheet) {
      return new Response(JSON.stringify({ result: false }))
    }
    const books = await prisma.books.findMany({
      where: {
        userId,
        sheet: { id: sheet.id },
        NOT: { finished: null },
      },
      select: {
        category: true,
        memo: true,
        finished: true,
      },
    })
    const targetBooks = books.filter((book) => {
      const month = dayjs(book.finished).month() + 1
      if (months.includes(month) && categories.includes(book.category)) {
        const memo = book.memo.replace(/\*.*\*/g, '***')
        return { ...book, memo }
      }
    })

    const response = await cohere
      .chatStream({
        model: 'command-r-plus',
        message: `${aiSummaryPrompt}\n${JSON.stringify(targetBooks)}`,
      })
      .catch((error) => {
        metricsHelpers.incrementAIAnalysisRequests('cohere', 'failure')
        throw error
      })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        for await (const event of response) {
          if (event.eventType === 'text-generation') {
            console.log(event.text)
            controller.enqueue(encoder.encode(event.text))
          }
          if (
            event.eventType === 'stream-end' &&
            event.finishReason === 'COMPLETE'
          ) {
            console.log(event.response.text)
            console.log(event.response.meta)
            const text = event.response.text
            const token =
              event.response.meta.tokens.inputTokens +
              event.response.meta.tokens.outputTokens
            controller.enqueue(encoder.encode(text))
            const json = JSON.parse(text)
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
                token,
              },
            })
            metricsHelpers.incrementAIAnalysisRequests('cohere', 'success')
          }
        }
        controller.enqueue(encoder.encode('COMPLETE'))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream; charset=utf-8' },
    })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ result: false }))
  }
}
