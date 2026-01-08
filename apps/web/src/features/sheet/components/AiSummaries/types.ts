/**
 * AI分析結果の型定義（最新スキーマバージョン）
 */
export type AiSummariesJson = {
  /** データベースID */
  id: number
  /** スキーマバージョン（マイグレーション管理用） */
  _schemaVersion?: number
  /** 元のスキーマバージョン（レガシー表示用） */
  _originalSchemaVersion?: number
  /** 一言でいうとこんな人 */
  character_summary: string
  /** 読書傾向分析 */
  reading_trend_analysis: string
  /** 感情分析 */
  sentiment_analysis: string
  /** 無意識に追いかけているもの */
  hidden_theme_discovery: string
  /** 総評 */
  overall_feedback: string
}
