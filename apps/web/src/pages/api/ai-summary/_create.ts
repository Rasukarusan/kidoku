import prisma from '@/libs/prisma/edge'
import dayjs from 'dayjs'
import { aiSummaryPrompt } from '@/libs/ai/prompt'
import { PERSONALITY_TYPE_IDS } from '@/libs/ai/personality/personality-types'
import openai from '@/libs/ai/openai'
import { RequestCookies } from '@edge-runtime/cookies'

export const handleCreate = async (req: Request) => {
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

    const response = await openai.chat.completions.create({
      model: 'gpt-5.4-mini',
      messages: [
        {
          role: 'user',
          content: `${aiSummaryPrompt}\n${JSON.stringify(targetBooks)}`,
        },
      ],
      response_format: { type: 'json_object' },
      stream: true,
      stream_options: { include_usage: true },
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let text = ''
        let token = 0
        for await (const chunk of response) {
          const delta = chunk.choices[0]?.delta?.content
          if (delta) {
            console.log(delta)
            text += delta
            controller.enqueue(encoder.encode(delta))
          }
          if (chunk.usage) {
            token = chunk.usage.total_tokens
          }
        }
        console.log(text)
        const json = JSON.parse(text)
        const {
          personality_type,
          character_summary,
          reading_trend_analysis,
          sentiment_analysis,
          hidden_theme_discovery,
          overall_feedback,
        } = json
        await prisma.aiSummaries.create({
          data: {
            userId,
            sheetId: sheet.id,
            analysis: {
              _schemaVersion: 3,
              // 定義外のタイプIDが返ってきた場合は未診断扱いにする
              personality_type: PERSONALITY_TYPE_IDS.includes(personality_type)
                ? personality_type
                : '',
              character_summary,
              reading_trend_analysis,
              sentiment_analysis,
              hidden_theme_discovery,
              overall_feedback,
            },
            token,
          },
        })
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
