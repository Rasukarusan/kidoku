import cohere from '.'
import { aiSummaryPrompt as prompt } from '../prompt'

export const chat = async (content) => {
  const res = await cohere.chat({
    model: 'command-r-plus',
    message: `${prompt}\n${content}`,
  })
  console.log(res)
  return res
}
