// fzf 風のあいまい検索。空白区切りの各語を部分列として含む行だけを残し、
// 連続一致・単語の先頭での一致・一致範囲の短さでスコアを付ける。

export interface FuzzyMatch {
  score: number
  /** 一致した文字のコードポイント単位の位置（ハイライト用） */
  positions: number[]
}

const BOUNDARY = /[\s\-_/.,:;()[\]「」『』（）・—]/

// 全角・半角、大文字・小文字、カタカナ・ひらがなの違いを無視する。
// 表示位置とずれないよう1文字ずつ正規化する
const fold = (text: string) =>
  Array.from(text).map((char) =>
    char
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[\u30a1-\u30f6]/g, (kana) =>
        String.fromCharCode(kana.charCodeAt(0) - 0x60)
      )
  )

function matchTerm(text: string[], term: string[]): FuzzyMatch | null {
  // 前方に走査して最初に全文字が揃う終端を探し、そこから後方に走査して最短の開始位置に寄せる
  let t = 0
  let end = -1
  for (let i = 0; i < text.length; i++) {
    if (text[i] === term[t] && ++t === term.length) {
      end = i
      break
    }
  }
  if (end === -1) return null
  const positions: number[] = []
  t = term.length - 1
  for (let i = end; i >= 0 && t >= 0; i--) {
    if (text[i] === term[t]) {
      positions.unshift(i)
      t--
    }
  }
  let score = 0
  positions.forEach((position, index) => {
    score += 16
    if (index > 0 && positions[index - 1] === position - 1) score += 8
    if (position === 0 || BOUNDARY.test(text[position - 1])) score += 10
  })
  score -= positions[positions.length - 1] - positions[0] + 1 - term.length
  return { score, positions }
}

export function fuzzyMatch(text: string, pattern: string): FuzzyMatch | null {
  const haystack = fold(text)
  const terms = pattern.split(/\s+/).filter(Boolean)
  if (!terms.length) return { score: 0, positions: [] }
  let score = 0
  const positions = new Set<number>()
  for (const term of terms) {
    const match = matchTerm(haystack, fold(term))
    if (!match) return null
    score += match.score
    match.positions.forEach((position) => positions.add(position))
  }
  return { score, positions: Array.from(positions).sort((a, b) => a - b) }
}

/** パターンに一致する項目をスコアの高い順（同点は元の順）に返す */
export function fuzzyFilter<T>(
  items: T[],
  pattern: string,
  toText: (item: T) => string
): Array<{ item: T; positions: number[] }> {
  return items
    .map((item, index) => ({
      item,
      index,
      match: fuzzyMatch(toText(item), pattern),
    }))
    .filter(
      (entry): entry is { item: T; index: number; match: FuzzyMatch } =>
        entry.match !== null
    )
    .sort((a, b) => b.match.score - a.match.score || a.index - b.index)
    .map(({ item, match }) => ({ item, positions: match.positions }))
}
