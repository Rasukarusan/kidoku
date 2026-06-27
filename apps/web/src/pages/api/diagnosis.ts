import openai from '@/libs/ai/openai'
import { demoDiagnosisPrompt } from '@/libs/ai/prompt'
import { normalizeDemoBooks } from '@/features/diagnosis/utils'

export const config = {
  runtime: 'edge',
}

/**
 * 未ログインでも体験できる「3冊で仮診断」エンドポイント。
 * 認証不要・DB保存なし。リクエストボディの本リストから読書性格を生成する。
 */
export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ result: false, error: 'Method not allowed' }),
      { status: 405 }
    )
  }

  try {
    const body = await req.json().catch(() => null)
    const books = normalizeDemoBooks(body?.books)
    if (!books) {
      return new Response(
        JSON.stringify({ result: false, error: 'Invalid input' }),
        { status: 400 }
      )
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-5.4-mini',
      messages: [
        {
          role: 'user',
          content: `${demoDiagnosisPrompt}\n${JSON.stringify(books)}`,
        },
      ],
      response_format: { type: 'json_object' },
    })

    const text = response.choices[0]?.message?.content ?? ''
    const json = JSON.parse(text)
    const character_summary =
      typeof json.character_summary === 'string' ? json.character_summary : ''
    const comment = typeof json.comment === 'string' ? json.comment : ''

    if (!character_summary) {
      return new Response(
        JSON.stringify({ result: false, error: 'No result' }),
        { status: 502 }
      )
    }

    return new Response(
      JSON.stringify({ result: true, character_summary, comment }),
      { headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    )
  } catch (e) {
    console.error(e)
    return new Response(
      JSON.stringify({ result: false, error: 'Internal error' }),
      { status: 500 }
    )
  }
}
