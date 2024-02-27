import dayjs from 'dayjs'

/**
 * 文字列を指定した長さで区切る
 */
export const truncate = (str: string, len: number, line?: number) => {
  if (!str) return '-'
  if (line) {
    const splits = str.split('\n')
    const lines = splits.length
    if (lines > line) return splits.slice(0, line).join('\n') + '...'
  }
  return str.length <= len ? str : str.substr(0, len) + '...'
}

/**
 * 指定文字で囲まれた文字列をマスキングする
 */
export const mask = (text: string) => {
  const symbol = '**'
  // 正規表現に特別な意味を持つ文字をエスケープ
  const masking = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // マスキングの正規表現パターン（`openSymbol`と`closeSymbol`で囲まれた文字列）
  const pattern = new RegExp(`${masking}(.*?)${masking}`, 'g')
  // 文字列をマスキング
  return text.replace(pattern, `*****`)
}

/**
 * 指定の日時からどのぐらい経過しているかの文字列を返す
 * ex.) "1日前" "3ヶ月前"
 */
export const getLastModified = (updated: string) => {
  const hour = dayjs().diff(dayjs(updated), 'hour', false)
  const day = dayjs().diff(dayjs(updated), 'day', false)
  const month = dayjs().diff(dayjs(updated), 'month', false)
  const year = dayjs().diff(dayjs(updated), 'year', false)
  if (hour === 0) {
    return 'ちょっと前'
  }
  if (day === 0) {
    return hour + '時間前'
  }
  if (month === 0) {
    return day + '日前'
  }
  if (year === 0) {
    return month + 'ヶ月前'
  }
  return year + '年前'
}
