/**
 * 元々のプロンプトは下記で、これをGPTに「英語のプロンプトにしてください」で英語に変換した。
 *
 *  -----------------------------------------
 * 以下のJSONを読み取り、ルールに基づきフィードバックを提供してください。
 * [ルール]
 * ・フィードバックは「読書傾向分析」「感情分析」「「もしも」シナリオ」「総評」の4項目
 * ・各分析の本文は「ユーザーは」や「あなたは」などは出力せず、本題から入ること
 * ・valueるだけ抽象的な表現は避け、極論を言う事
 * ・valueはそれぞれ最大200文字までとする
 * ・出力はjsonでキー名はそれぞれreading_trend_analysis, sentiment_analysis, what_if_scenario,overall_feedbackで、valueは日本語で出力
 * ・分析に必要なデータが十分ではない場合、各valueは「分析に必要なデータが足りません」とする
 * ・読書傾向分析：ユーザーが好むジャンル、著者、テーマを分析し、その傾向を可視化する
 * ・感情分析：ユーザーが読んだ本の感想を分析して、どんな本が最もポジティブな反応を引き出したか、または特定の感情を呼び起こしたかを示す
 * ・「もしも」シナリオ：ユーザーが異なるジャンルや著者を選んだ場合にどのような読書体験になるかを想像させる仮想シナリオを提示する
 * ・総評：ユーザーがどんな人間なのかを示します。
 *  -----------------------------------------
 *
 * Tips1. 英語のプロンプトにしている理由：英語にするとトークン数が約半分になるため
 * Tips2. 出力文字数の制限(400~600)の理由：日本語だと「200文字以内」とすると指定どおりになる。しかし英語のプロンプトだと200字に制限した場合、おそらく英語で200字となってしまい、それを日本語化するとかなり短い文章となってしまう。そのため多めの400~600文字に制限している。
 *
 */
export const aiSummaryPrompt = `
Provide feedback on the following JSON based on the rules below:

Rules:

Feedback should consist of 4 sections: "Reading Trend Analysis", "Sentiment Analysis", "What-If Scenario", and "Overall Feedback".
The body of each analysis should start directly with the topic, without using phrases like "The user", "This user" or "You".
Avoid ambiguity and use extreme expressions.
Limit each section to 400 ~ 600characters.
Output should be in JSON format with keys "reading_trend_analysis", "sentiment_analysis", "what_if_scenario", and "overall_feedback". Values should be in Japanese.
If there is insufficient data for analysis, each value should be "分析に必要なデータが足りません" (Data insufficient for analysis).
Sections:

Reading Trend Analysis: Analyze the user's preferred genres, authors, and themes, and visualize the trends.
Sentiment Analysis: Analyze the user's feedback on the books they have read and show which books elicited the most positive reactions or evoked specific emotions.
What-If Scenario: Present a hypothetical scenario that imagines the user's reading experience if they chose different genres or authors.
Overall Feedback: Provide insights into the user's personality.
`
