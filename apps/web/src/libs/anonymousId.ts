/**
 * 未ログインユーザーを識別するための匿名ID。
 * Cookie に保存し、いいねの重複防止・取り消し・いいね済み表示に利用する。
 */
const COOKIE_NAME = 'kidoku_anon_id'
const ONE_YEAR_SEC = 60 * 60 * 24 * 365

const readCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name + '=([^;]*)')
  )
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * 匿名IDを取得する。未発行ならCookieに新規発行して返す。
 * サーバーサイドでは空文字を返す（呼び出し側でクライアント判定すること）。
 */
export const getOrCreateAnonymousId = (): string => {
  if (typeof document === 'undefined') return ''
  const existing = readCookie(COOKIE_NAME)
  if (existing) return existing
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  document.cookie = `${COOKIE_NAME}=${id}; path=/; max-age=${ONE_YEAR_SEC}; SameSite=Lax`
  return id
}
