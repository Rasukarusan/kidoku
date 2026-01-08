import { MdOutlineSentimentSatisfied } from 'react-icons/md'
import { AI_SUMMARY_FIELDS, AiSummaryFieldKey } from './fields'
import { IconType } from 'react-icons'

/**
 * AI分析フィールドのタイトルとアイコンを取得する
 *
 * フィールド定義から動的に生成するため、新しいフィールド追加時に
 * この関数を変更する必要がない
 *
 * @param jsonKey - AI分析のフィールドキー
 * @param originalSchemaVersion - 元のスキーマバージョン（レガシー表示用）
 * @returns タイトルとアイコンコンポーネント
 */
export const getTitleAndIcon = (
  jsonKey: string,
  originalSchemaVersion?: number
): { Icon: IconType; title: string } => {
  // _schemaVersionなどの内部フィールドは無視
  if (jsonKey.startsWith('_')) {
    return {
      Icon: MdOutlineSentimentSatisfied,
      title: '',
    }
  }

  // フィールド定義から取得
  const field = AI_SUMMARY_FIELDS[jsonKey as AiSummaryFieldKey]

  if (field) {
    // 元のバージョンに対応するタイトルがあればそれを使用
    const title =
      originalSchemaVersion &&
      'titleByVersion' in field &&
      field.titleByVersion[originalSchemaVersion]
        ? field.titleByVersion[originalSchemaVersion]
        : field.title

    return {
      Icon: field.icon,
      title,
    }
  }

  // 未知のフィールドの場合はデフォルト値を返す
  return {
    Icon: MdOutlineSentimentSatisfied,
    title: '',
  }
}
