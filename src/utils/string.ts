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
