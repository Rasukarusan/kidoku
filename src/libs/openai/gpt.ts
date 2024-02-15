import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function chat(content) {
  const prompt = `
以下のJSONを読み取り、ルールに基づきフィードバックを提供してください。
[ルール]
・前置きは出力しないでください。
・フィードバックは「読書傾向分析」「感情分析」「「もしも」シナリオ」「総評」の4項目です。
・各分析の本文は「ユーザーは」や「あなたは」などは出力せず、本題から入ってください。
・できるだけ抽象的な表現は避け、推測や極論で良いので決めつけるような口調でお願いします。
・出力はjsonでキー名はそれぞれreading_trend_analysis, sentiment_analysis, what_if_scenario,overall_feedbackで、valueは日本語でお願いします。
・分析に必要なデータが十分ではない場合、各valueは「分析に必要なデータが足りません」としてください。

・読書傾向分析：ユーザーが好むジャンル、著者、テーマを分析し、その傾向を可視化する。たとえば、グラフやチャートを使用して、彼らの読書パターンを示す。

・感情分析：ユーザーが読んだ本のレビューや感想を分析して、どの本が最もポジティブな反応を引き出したか、または特定の感情を呼び起こしたかを示す。

・「もしも」シナリオ：ユーザーが異なるジャンルや著者を選んだ場合にどのような読書体験になるかを想像させる仮想シナリオを提示する。

・総評：ユーザーがどんな人間なのかを示します。
-----------
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
    model: 'gpt-4-0125-preview',
    response_format: {
      type: 'json_object',
    },
  })
  return chatCompletion
}
