export interface DemoBookInput {
  title: string
  author: string
  category: string
}

export const MAX_DEMO_BOOKS = 3
export const MAX_FIELD_LENGTH = 100

/**
 * 未ログイン仮診断エンドポイントの入力を検証・正規化する。
 * 認証なしでAIを叩くため、件数・文字数の上限を設けて悪用を抑える。
 * 不正な入力の場合は null を返す。
 */
export const normalizeDemoBooks = (input: unknown): DemoBookInput[] | null => {
  if (!Array.isArray(input)) return null
  if (input.length < 1 || input.length > MAX_DEMO_BOOKS) return null

  const books: DemoBookInput[] = []
  for (const item of input) {
    if (!item || typeof item !== 'object') return null
    const raw = item as Record<string, unknown>
    const title = typeof raw.title === 'string' ? raw.title.trim() : ''
    if (!title) return null
    books.push({
      title: title.slice(0, MAX_FIELD_LENGTH),
      author:
        typeof raw.author === 'string'
          ? raw.author.trim().slice(0, MAX_FIELD_LENGTH)
          : '',
      category:
        typeof raw.category === 'string'
          ? raw.category.trim().slice(0, MAX_FIELD_LENGTH)
          : '',
    })
  }
  return books
}
