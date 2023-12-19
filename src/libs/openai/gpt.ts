import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function chat() {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'こんにちわ' }],
    model: 'gpt-4-1106-preview',
  })
  return chatCompletion
}
