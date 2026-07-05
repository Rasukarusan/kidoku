export const DEFAULT_PER_PAGE = 100
export const MAX_PER_PAGE = 200

export type Pagination = { page: number; perPage: number }
export type PaginationError = { error: string }

const parsePositiveInt = (
  value: string | string[] | undefined,
  defaultValue: number
): number | null => {
  if (value === undefined) return defaultValue
  const raw = Array.isArray(value) ? value[0] : value
  if (!/^\d+$/.test(raw)) return null
  const parsed = parseInt(raw, 10)
  if (parsed < 1) return null
  return parsed
}

// クエリパラメータからページネーション情報を取り出す。
// page: 1始まり（デフォルト1）、perPage: デフォルト100・最大200（超過分は切り詰め）
export const parsePagination = (query: {
  page?: string | string[]
  perPage?: string | string[]
}): Pagination | PaginationError => {
  const page = parsePositiveInt(query.page, 1)
  if (page === null) {
    return { error: 'pageは1以上の整数で指定してください' }
  }
  const perPage = parsePositiveInt(query.perPage, DEFAULT_PER_PAGE)
  if (perPage === null) {
    return { error: 'perPageは1以上の整数で指定してください' }
  }
  return { page, perPage: Math.min(perPage, MAX_PER_PAGE) }
}
