/**
 * 文字列を指定した長さで区切る
 */
export const truncate = (str: string, len: number) => {
  if (!str) return '-'
  return str.length <= len ? str : str.substr(0, len) + '...'
}
