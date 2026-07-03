/**
 * RFC4180準拠の簡易CSVパーサ。
 * ダブルクォートで囲まれたフィールド（カンマ・改行・エスケープされた""を含む）に対応する。
 */
export function parseCSV(input: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  // BOMを除去
  const text = input.replace(/^\uFEFF/, '')

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      field = ''
      rows.push(row)
      row = []
    } else {
      field += char
    }
  }
  // 最終行（末尾に改行がない場合）
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  // 完全な空行は除外
  return rows.filter((r) => !(r.length === 1 && r[0] === ''))
}
