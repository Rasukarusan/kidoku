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
 * [[MASK: text]] -> *****
 * \[\[MASK: text\]\] -> ***** (エスケープされたバージョンも対応)
 *
 * 注意: 必ずサーバーサイド(getStaticProps等)で使用すること。
 * フロントエンドで使用しても__NEXT_DATA__等に生データが残るため意味がない。
 */
export const mask = (text: string) => {
  // エスケープされていないバージョン
  const pattern = /\[\[MASK:\s*(.*?)\]\]/g
  // エスケープされたバージョン（DBに保存時にエスケープされる場合）
  const escapedPattern = /\\\[\\\[MASK:\s*(.*?)\\\]\\\]/g
  return text.replace(pattern, '*****').replace(escapedPattern, '*****')
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

export const randomStr = (length = 4) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let string = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    string += characters[randomIndex]
  }
  return string
}
