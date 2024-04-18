import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources'
import { aiSummaryPrompt as prompt } from '../prompt'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function chat(content) {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: prompt,
    },
    {
      role: 'user',
      content,
    },
  ]
  console.time('ai-summary')
  const chatCompletion = await openai.chat.completions.create({
    messages,
    model: 'gpt-3.5-turbo-0125',
    response_format: {
      type: 'json_object',
    },
  })
  console.log(messages)
  console.log(chatCompletion)
  console.timeEnd('ai-summary')
  return chatCompletion
}
