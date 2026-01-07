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

/**
 * スキーママイグレーション定義リスト
 *
 * 新しいスキーマバージョンを追加する際は、ここに変換ルールを追加する
 *
 * @example
 * // バージョン3を追加する場合
 * {
 *   from: 2,
 *   to: 3,
 *   transformations: [
 *     { type: 'add', key: 'new_feature', defaultValue: '' },
 *     { type: 'remove', key: 'deprecated_field' }
 *   ]
 * }
 */
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
  // 将来的なマイグレーション例：
  // {
  //   from: 2,
  //   to: 3,
  //   transformations: [
  //     { type: 'add', key: 'reading_motivation', defaultValue: '' },
  //   ]
  // }
]
