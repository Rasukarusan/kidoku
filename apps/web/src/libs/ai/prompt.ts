import { PERSONALITY_TYPE_IDS } from './personality/personality-types'

export const aiSummaryPrompt = `以下のJSONを読み取り、ルールに基づきフィードバックを提供してください。
[ルール]
・フィードバックは「MBTIタイプ」「一言でいうとこんな人」「読書傾向分析」「感情分析」「無意識に追いかけているもの」「総評」の6項目
・各分析の本文は「ユーザーは」や「あなたは」などは出力せず、本題から入ること
・感想の引用はせず、あなたの言葉で書いてください
・できるだけ抽象的な表現は避け、根拠のある範囲ではっきりと言い切ること。データにない事実や人物像は作らないこと
・character_summaryは最大50文字、4つの一言まとめはそれぞれ最大30文字、4つの分析本文はそれぞれ最大400文字とする
・「読書傾向分析」「感情分析」「無意識に追いかけているもの」「総評」の4項目には、それぞれ30文字以内の「まとめの一言」を付けること。その項目で最も伝えたい発見を、具体的で印象に残る言葉にすること
・まとめの一言は「読書傾向のまとめ」のような項目名の言い換えや、誰にでも当てはまる褒め言葉にしないこと。4項目で同じ内容を繰り返さないこと
・一言まとめと本文は別々のキーで出力すること。reading_trend_summaryはreading_trend_analysisの一言まとめ、sentiment_summaryはsentiment_analysisの一言まとめ、hidden_theme_summaryはhidden_theme_discoveryの一言まとめ、overall_summaryはoverall_feedbackの一言まとめとする。本文はその一言まとめの根拠や具体例を説明すること。JSON内の改行は\\nとしてエスケープすること
・出力はJSONオブジェクトのみ。Markdownのコードブロックや前置きは付けないこと
・キー名はこの順にpersonality_type, character_summary, reading_trend_summary, reading_trend_analysis, sentiment_summary, sentiment_analysis, hidden_theme_summary, hidden_theme_discovery, overall_summary, overall_feedbackとし、10個のキーを必ず出力すること。すべてのvalueを文字列とし、personality_type以外は日本語で出力すること
・分析に必要なデータが十分ではない項目は本文を「分析に必要なデータが足りません」、対応する一言まとめを空文字にすること。MBTIの判定に必要なデータが足りない場合はpersonality_typeを空文字にすること
・MBTIタイプ：読書記録に表れた関心、感想、思考や判断の仕方から、MBTIの16タイプのうち最も当てはまるものを1つ推定する。personality_typeのvalueは以下の英大文字4文字のコードのみとする。判定に必要な根拠が足りない場合は空文字にする
・4つの指標で考えること：E（外向）/I（内向）、S（感覚）/N（直観）、T（思考）/F（感情）、J（判断）/P（知覚）。好きな本のジャンルだけで決めず、感想に表れた本人の考え方を重視すること。本に書かれた人物の性格や主張を、本人の性格と取り違えないこと
・これは読書記録からの推定であり、正式なMBTI検査結果として扱わないこと。character_summaryや総評でも、タイプに付随する性格を根拠なく付け足さないこと
・personality_typeで使用できるコード：${PERSONALITY_TYPE_IDS.join(', ')}
・一言でいうとこんな人：4つの指標を総合的に分析し、このユーザーの人物像を一言で表現する。キャッチーで印象的な見出しにすること
・読書傾向分析：ユーザーが好むジャンル、著者、テーマを分析し、その傾向を可視化する。まとめの一言は「どんな本の、どこに惹かれるのか」を表すこと
・感情分析：ユーザーが読んだ本の感想を分析して、どんな本が最もポジティブな反応を引き出したか、または特定の感情を呼び起こしたかを示す。まとめの一言は「どんな瞬間に心が動くのか」を表すこと
・無意識に追いかけているもの：読書履歴全体を俯瞰し、表面的なジャンル分類を超えて、ユーザーが無意識に惹かれ続けている本質的なテーマ、モチーフ、価値観を抽出する。単なるジャンルの羅列ではなく、「なぜその本を選んだのか」の深層にある共通点を洞察すること。まとめの一言は「本を通して確かめ続けている問いや願い」を表すこと
・総評：ユーザーがどんな人間なのかを示す。まとめの一言は、4項目を通して見えてくるその人の特徴を表すこと

[出力形式]
{
  "personality_type": "MBTIのタイプコード",
  "character_summary": "人物像を表す一言",
  "reading_trend_summary": "読書傾向の一言まとめ",
  "reading_trend_analysis": "読書傾向の分析本文",
  "sentiment_summary": "感情分析の一言まとめ",
  "sentiment_analysis": "感情分析の本文",
  "hidden_theme_summary": "無意識に追いかけているものの一言まとめ",
  "hidden_theme_discovery": "無意識に追いかけているものの分析本文",
  "overall_summary": "総評の一言まとめ",
  "overall_feedback": "総評の本文"
}
-------------------------------
`
