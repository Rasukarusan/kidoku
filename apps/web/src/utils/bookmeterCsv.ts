/**
 * 読書メーター関連CSVのパースユーティリティ
 *
 * 読書メーター(bookmeter.com)は公式のCSVエクスポート機能を提供していないため、
 * デファクトスタンダードとして使われている以下のサードパーティ製
 * エクスポートツールのCSV形式をサポートする。
 *
 * 1. bookmeter_exporter (https://github.com/ikuwow/bookmeter_exporter)
 *    ヘッダーなし: `ASIN/ISBN,読了日(YYYY/MM/DD),感想`
 * 2. export_bookmeter (https://github.com/dogatana/export_bookmeter)
 *    ヘッダーあり: `title,author(s),cover`
 */
import { validateISBN, normalizeISBN } from './isbn'

export type BookmeterCsvFormat = 'bookmeter_exporter' | 'export_bookmeter'

export interface BookmeterBook {
  /** CSV上の行番号(1始まり) */
  line: number
  /** export_bookmeter形式: タイトル */
  title?: string
  /** export_bookmeter形式: 著者(複数の場合カンマ区切り) */
  author?: string
  /** export_bookmeter形式: 表紙画像URL */
  image?: string
  /** bookmeter_exporter形式: ISBN(ハイフンなしに正規化済み) */
  isbn?: string
  /** bookmeter_exporter形式: ASIN(Kindle本など) */
  asin?: string
  /** bookmeter_exporter形式: 読了日(YYYY/MM/DD) */
  finished?: string
  /** bookmeter_exporter形式: 感想 */
  memo?: string
}

export interface BookmeterInvalidLine {
  line: number
  value: string
}

export interface BookmeterCsvParseResult {
  format: BookmeterCsvFormat
  books: BookmeterBook[]
  /** 形式不正で取り込めなかった行 */
  invalidLines: BookmeterInvalidLine[]
}

/** AmazonのASIN形式(Kindle本などISBNを持たない商品) */
const ASIN_PATTERN = /^B[0-9A-Z]{9}$/i

/** ISBNらしい形状(チェックディジット検証はしない緩い判定) */
const ISBN_LIKE_PATTERN = /^(\d{9}[\dX]|\d{13})$/i

/**
 * CSV文字列を2次元配列にパースする(RFC 4180準拠)
 * - ダブルクォートによる囲み、クォート内のカンマ・改行・エスケープ("")に対応
 * - 先頭のBOM、CRLF/CR/LF改行に対応
 * - 完全な空行は除外する
 */
export const parseCsv = (text: string): string[][] => {
  const src = text.replace(/^\uFEFF/, '')
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++
      row.push(field)
      field = ''
      rows.push(row)
      row = []
    } else {
      field += c
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter((r) => r.some((v) => v.trim() !== ''))
}

/**
 * 読書メーターのエクスポートCSVをパースする
 * ヘッダー行の有無と1列目の内容からフォーマットを自動判定する
 * @throws フォーマットを判定できない場合
 */
export const parseBookmeterCsv = (text: string): BookmeterCsvParseResult => {
  const rows = parseCsv(text)
  if (rows.length === 0) {
    throw new Error('CSVにデータがありません')
  }

  const header = rows[0].map((v) => v.trim().toLowerCase())
  if (header[0] === 'title' && /^author/.test(header[1] ?? '')) {
    return parseExportBookmeter(rows)
  }

  const first = (rows[0][0] ?? '').trim()
  if (ISBN_LIKE_PATTERN.test(first) || ASIN_PATTERN.test(first)) {
    return parseBookmeterExporter(rows)
  }

  throw new Error(
    '読書メーターのエクスポートCSV形式として認識できませんでした。対応形式: bookmeter_exporter(ISBN,読了日,感想) / export_bookmeter(title,author(s),cover)'
  )
}

/** export_bookmeter形式(ヘッダーあり: title,author(s),cover)のパース */
const parseExportBookmeter = (rows: string[][]): BookmeterCsvParseResult => {
  const books: BookmeterBook[] = []
  const invalidLines: BookmeterInvalidLine[] = []

  rows.slice(1).forEach((row, i) => {
    const line = i + 2
    const title = (row[0] ?? '').trim()
    const author = (row[1] ?? '').trim()
    const image = (row[2] ?? '').trim()
    if (!title) {
      invalidLines.push({ line, value: row.join(',') })
      return
    }
    books.push({ line, title, author, image })
  })

  return { format: 'export_bookmeter', books, invalidLines }
}

/** bookmeter_exporter形式(ヘッダーなし: ASIN/ISBN,読了日,感想)のパース */
const parseBookmeterExporter = (rows: string[][]): BookmeterCsvParseResult => {
  const books: BookmeterBook[] = []
  const invalidLines: BookmeterInvalidLine[] = []

  rows.forEach((row, i) => {
    const line = i + 1
    const id = (row[0] ?? '').trim()
    const finished = (row[1] ?? '').trim()
    const memo = (row[2] ?? '').trim()
    if (validateISBN(id)) {
      books.push({ line, isbn: normalizeISBN(id), finished, memo })
    } else if (ASIN_PATTERN.test(id)) {
      books.push({ line, asin: id.toUpperCase(), finished, memo })
    } else {
      invalidLines.push({ line, value: row.join(',') })
    }
  })

  return { format: 'bookmeter_exporter', books, invalidLines }
}
