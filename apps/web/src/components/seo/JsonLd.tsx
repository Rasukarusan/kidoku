interface Props {
  data: Record<string, unknown> | Record<string, unknown>[]
}

/**
 * 構造化データ(JSON-LD)を出力する。
 * 検索エンジンが本・レビュー・プロフィールを理解しやすくし、リッチリザルト流入を狙う。
 */
export const JsonLd: React.FC<Props> = ({ data }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
  />
)
