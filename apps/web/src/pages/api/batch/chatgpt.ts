import openai from '@/libs/ai/openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { ChatCompletionRequestMessage } from 'openai-edge'

export const runtime = 'edge'

export default async function handler() {
  const prompt = 'JSONでkeyは英語、valueは日本語で出力してください'
  const content = '適当な自己紹介をしてください'
  const messages: ChatCompletionRequestMessage[] = [
    {
      role: 'user',
      content: prompt,
    },
    {
      role: 'user',
      content,
    },
  ]
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo-0125',
    stream: true,
    messages,
  })
  const stream = OpenAIStream(response)
  return new StreamingTextResponse(stream)
}
