import { AI_SUMMARY_SCHEMA_VERSION } from './schema'
import { MIGRATIONS, Migration, TransformationType } from './migrations'
import { AiSummariesJson } from './types'

/**
 * 単一のマイグレーション変換を適用する
 */
function applyTransformation(
  data: Record<string, unknown>,
  transformation: TransformationType
): Record<string, unknown> {
  const result = { ...data }

  switch (transformation.type) {
    case 'rename':
      if (transformation.oldKey in result) {
        result[transformation.newKey] = result[transformation.oldKey]
        delete result[transformation.oldKey]
      }
      break
    case 'add':
      if (!(transformation.key in result)) {
        result[transformation.key] = transformation.defaultValue
      }
      break
    case 'remove':
      delete result[transformation.key]
      break
  }

  return result
}

/**
 * 単一のマイグレーションを適用する
 */
function applyMigration(
  data: Record<string, unknown>,
  migration: Migration
): Record<string, unknown> {
  let result = { ...data }

  for (const transformation of migration.transformations) {
    result = applyTransformation(result, transformation)
  }

  result._schemaVersion = migration.to
  return result
}

/**
 * AI分析データを最新のスキーマバージョンにマイグレーションする
 *
 * @param analysis - マイグレーション対象のAI分析データ
 * @returns 最新スキーマバージョンに変換されたデータ
 *
 * @example
 * ```typescript
 * // バージョン1のデータをバージョン2にマイグレーション
 * const oldData = {
 *   character_summary: "...",
 *   what_if_scenario: "..." // 旧フィールド名
 * }
 *
 * const newData = migrateAnalysis(oldData)
 * // => {
 * //   _schemaVersion: 2,
 * //   character_summary: "...",
 * //   hidden_theme_discovery: "..." // 新フィールド名
 * // }
 * ```
 */
export function migrateAnalysis(
  analysis: Record<string, unknown>
): AiSummariesJson {
  // _schemaVersionがない場合はバージョン1として扱う
  const currentVersion = analysis._schemaVersion || 1

  // すでに最新バージョンの場合はそのまま返す
  if (currentVersion === AI_SUMMARY_SCHEMA_VERSION) {
    return analysis as AiSummariesJson
  }

  let migrated = { ...analysis }

  // 元のスキーマバージョンを保持（レガシー表示用）
  migrated._originalSchemaVersion = currentVersion

  // 現在のバージョンから最新バージョンまで順次マイグレーション
  for (
    let version = currentVersion;
    version < AI_SUMMARY_SCHEMA_VERSION;
    version++
  ) {
    const migration = MIGRATIONS.find((m) => m.from === version)
    if (migration) {
      migrated = applyMigration(migrated, migration)
    } else {
      // マイグレーションパスが見つからない場合は警告
      console.warn(
        `No migration path found from version ${version} to ${version + 1}`
      )
    }
  }

  return migrated as AiSummariesJson
}

/**
 * 複数のAI分析データをバッチでマイグレーションする
 *
 * @param analyses - マイグレーション対象のAI分析データの配列
 * @returns 最新スキーマバージョンに変換されたデータの配列
 */
export function migrateAnalyses(
  analyses: Record<string, unknown>[]
): AiSummariesJson[] {
  return analyses.map(migrateAnalysis)
}
