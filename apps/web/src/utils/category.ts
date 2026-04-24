/**
 * 検索で取得したカテゴリを既存カテゴリに寄せて正規化する。
 * 例: 取得「人文・エッセイ」、既存に「エッセイ」があれば「エッセイ」を返す。
 *
 * マッチ判定は以下の順序で行う:
 *   1. 完全一致
 *   2. 取得カテゴリを区切り文字で分割したトークンが既存と完全一致
 *   3. 既存カテゴリを区切り文字で分割したトークンが取得カテゴリと完全一致
 * いずれにも当てはまらなければ取得カテゴリをそのまま返す。
 */
const SEPARATOR_REGEX = /[・／/（）()、，,]/

const tokenize = (value: string): string[] =>
  value
    .split(SEPARATOR_REGEX)
    .map((token) => token.trim())
    .filter(Boolean)

export const normalizeCategory = (
  fetched: string | null | undefined,
  existing: readonly string[] | null | undefined
): string => {
  if (!fetched) return fetched ?? ''
  const trimmed = fetched.trim()
  if (!existing || existing.length === 0) return trimmed

  if (existing.includes(trimmed)) return trimmed

  const fetchedTokens = tokenize(trimmed)
  for (const token of fetchedTokens) {
    if (existing.includes(token)) return token
  }

  for (const category of existing) {
    if (!category) continue
    const tokens = tokenize(category)
    if (tokens.includes(trimmed)) return category
  }

  return trimmed
}
