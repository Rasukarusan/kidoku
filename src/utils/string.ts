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
