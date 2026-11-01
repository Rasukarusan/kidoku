import { SchemaVersion } from './schema'

/**
 * マイグレーション変換タイプ
 */
export type TransformationType =
  | {
      /** フィールド名の変更 */
      type: 'rename'
      oldKey: string
      newKey: string
    }
  | {
      /** フィールドの追加 */
      type: 'add'
      key: string
      defaultValue: string
    }
  | {
      /** フィールドの削除 */
      type: 'remove'
      key: string
    }

/**
 * マイグレーション定義
 */
export interface Migration {
  from: SchemaVersion
  to: SchemaVersion
  transformations: TransformationType[]
}

export const MIGRATIONS: Migration[] = [
  {
    from: 1,
    to: 2,
    transformations: [
      {
        type: 'rename',
        oldKey: 'what_if_scenario',
        newKey: 'hidden_theme_discovery',
      },
    ],
  },
  {
    from: 2,
    to: 3,
    transformations: [
      // 読書性格タイプ（MBTI風診断）。過去データは未診断のため空文字
      { type: 'add', key: 'personality_type', defaultValue: '' },
    ],
  },
  {
    from: 3,
    to: 4,
    transformations: [
      { type: 'add', key: 'reading_trend_summary', defaultValue: '' },
      { type: 'add', key: 'sentiment_summary', defaultValue: '' },
      { type: 'add', key: 'hidden_theme_summary', defaultValue: '' },
      { type: 'add', key: 'overall_summary', defaultValue: '' },
    ],
  },
]
