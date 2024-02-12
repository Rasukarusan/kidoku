import { OpenAIStream, StreamingTextResponse } from 'ai'
import { ChatCompletionRequestMessage } from 'openai-edge'
import openai from '@/libs/openai'

export async function chat(content) {
  const prompt = `
以下の質問に答えてください。
`
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
