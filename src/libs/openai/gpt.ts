import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function chat(content) {
  const prompt = `
以以下のJSONを読み取り、下記の項目についてと総評をフィードバックしてください。
読書傾向分析: ユーザーが好むジャンル、著者、テーマを分析し、その傾向を可視化する。たとえば、グラフやチャートを使用して、彼らの読書パターンを示す。
感情分析: ユーザーが読んだ本のレビューや感想を分析して、どの本が最もポジティブな反応を引き出したか、または特定の感情を呼び起こしたかを示す。
「もしも」シナリオ: ユーザーが異なるジャンルや著者を選んだ場合にどのような読書体験になるかを想像させる仮想シナリオを提示する。
下のJSONを読み取り、下記の項目についてと総評をフィードバックしてください。
読書傾向分析: ユーザーが好むジャンル、著者、テーマを分析し、その傾向を可視化する。たとえば、グラフやチャートを使用して、彼らの読書パターンを示す。
感情分析: ユーザーが読んだ本のレビューや感想を分析して、どの本が最もポジティブな反応を引き出したか、または特定の感情を呼び起こしたかを示す。
「もしも」シナリオ: ユーザーが異なるジャンルや著者を選んだ場合にどのような読書体験になるかを想像させる仮想シナリオを提示する。
  `
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: prompt,
      },
      {
        role: 'user',
        content,
      },
    ],
    model: 'gpt-4-1106-preview',
  })
  return chatCompletion
}
