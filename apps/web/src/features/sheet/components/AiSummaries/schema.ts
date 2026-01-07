/**
 * AI分析データのスキーマバージョン管理
 *
 * スキーマバージョンは以下のルールに従う：
 * - フィールドの追加・削除・名前変更時にバージョンをインクリメント
 * - 既存データとの互換性を保つため、マイグレーション定義を追加
 */

/**
 * 現在の最新スキーマバージョン
 */
export const AI_SUMMARY_SCHEMA_VERSION = 2

/**
 * スキーマバージョンごとのフィールド定義
 */
export const AI_SUMMARY_SCHEMAS = {
  1: {
    version: 1,
    fields: [
      'character_summary',
      'reading_trend_analysis',
      'sentiment_analysis',
      'what_if_scenario',
      'overall_feedback',
    ] as const,
  },
  2: {
    version: 2,
    fields: [
      'character_summary',
      'reading_trend_analysis',
      'sentiment_analysis',
      'hidden_theme_discovery',
      'overall_feedback',
    ] as const,
  },
} as const

export type SchemaVersion = keyof typeof AI_SUMMARY_SCHEMAS
