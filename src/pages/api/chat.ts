import cohere from '@/libs/ai/cohere'

export const runtime = 'edge'

export default async function handler(req: Request) {
  const { message } = await req.json()
  const prompt = '50字程度で自己紹介してください。'
  const response = await cohere.chatStream({
    model: 'command-r-plus',
    message: `${prompt}\n${message}`,
  })

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      for await (const event of response) {
        if (event.eventType === 'text-generation') {
          console.log(event.text)
          controller.enqueue(encoder.encode(event.text))
        }
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream; charset=utf-8' },
  })
}
