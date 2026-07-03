import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import prisma from '@/libs/prisma'
import { NO_IMAGE } from '@/libs/constants'
import {
  parseBookmeterCsv,
  BookmeterCsvParseResult,
} from '@/utils/bookmeterCsv'
import { convertISBN10to13 } from '@/utils/isbn'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
}

/** 一度にインポートできる最大冊数 */
const MAX_BOOKS = 1000
/** openBDへ1リクエストで問い合わせるISBN数 */
const OPENBD_CHUNK_SIZE = 100
/** openBDのエンドポイント(テスト時に差し替え可能) */
const OPENBD_API_URL =
  process.env.OPENBD_API_URL || 'https://api.openbd.jp/v1/get'

interface BookInfo {
  title: string
  author: string
  category: string
  image: string
}

interface SkippedRow {
  line: number
  value: string
  reason: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ result: false, message: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user?.id) {
    return res
      .status(401)
      .json({ result: false, message: 'ログインしてください' })
  }
  const userId = session.user.id

  const { csv, sheetName } = req.body ?? {}
  if (typeof csv !== 'string' || csv.trim() === '') {
    return res
      .status(400)
      .json({ result: false, message: 'CSVファイルの内容が空です' })
  }
  const name = typeof sheetName === 'string' ? sheetName.trim() : ''
  if (!name || name.length > 120) {
    return res.status(400).json({
      result: false,
      message: 'シート名は1〜120文字で指定してください',
    })
  }

  let parsed: BookmeterCsvParseResult
  try {
    parsed = parseBookmeterCsv(csv)
  } catch (e) {
    return res
      .status(400)
      .json({ result: false, message: (e as Error).message })
  }

  if (parsed.books.length === 0) {
    return res
      .status(400)
      .json({ result: false, message: 'インポート対象の書籍がありません' })
  }
  if (parsed.books.length > MAX_BOOKS) {
    return res.status(400).json({
      result: false,
      message: `一度にインポートできるのは${MAX_BOOKS}冊までです`,
    })
  }

  try {
    const skipped: SkippedRow[] = parsed.invalidLines.map((invalid) => ({
      line: invalid.line,
      value: invalid.value,
      reason: 'CSVの形式が不正です',
    }))

    // bookmeter_exporter形式のISBNをopenBDでまとめて書籍情報に解決する
    const isbn13List = [
      ...new Set(
        parsed.books
          .filter((book) => book.isbn)
          .map((book) => toISBN13(book.isbn as string))
      ),
    ]
    const bookInfoMap = await fetchOpenBDBooks(isbn13List)

    // インポート先シートを取得(なければ作成)
    let sheet = await prisma.sheets.findFirst({ where: { userId, name } })
    if (!sheet) {
      const maxOrder = await prisma.sheets.aggregate({
        where: { userId },
        _max: { order: true },
      })
      sheet = await prisma.sheets.create({
        data: { userId, name, order: (maxOrder._max.order ?? 0) + 1 },
      })
    }

    // 同一シート内の同名タイトルはスキップ(再実行時の重複登録防止)
    const existingBooks = await prisma.books.findMany({
      where: { sheetId: sheet.id },
      select: { title: true },
    })
    const seenTitles = new Set(existingBooks.map((book) => book.title))

    const data: {
      userId: string
      sheetId: number
      title: string
      author: string
      category: string
      image: string
      impression: string
      memo: string
      isPublicMemo: boolean
      finished: Date | null
    }[] = []

    for (const book of parsed.books) {
      if (book.asin) {
        skipped.push({
          line: book.line,
          value: book.asin,
          reason: 'Kindle本(ASIN)のため書籍情報を取得できません',
        })
        continue
      }

      let title: string
      let author: string
      let category = '未分類'
      let image = NO_IMAGE

      if (book.isbn) {
        const info = bookInfoMap.get(toISBN13(book.isbn))
        if (!info || !info.title) {
          skipped.push({
            line: book.line,
            value: book.isbn,
            reason: '書籍情報が見つかりませんでした',
          })
          continue
        }
        title = info.title
        author = info.author || '著者不明'
        category = info.category || '未分類'
        image = info.image || NO_IMAGE
      } else {
        title = book.title as string
        author = book.author || '著者不明'
        if (book.image && book.image.startsWith('http')) {
          image = book.image.replace('http:', 'https:')
        }
      }

      if (seenTitles.has(title)) {
        skipped.push({
          line: book.line,
          value: title,
          reason: '同名の本がすでに登録されています',
        })
        continue
      }
      seenTitles.add(title)

      data.push({
        userId,
        sheetId: sheet.id,
        title: title.slice(0, 120),
        author: author.slice(0, 120),
        category: category.slice(0, 120),
        image: image.slice(0, 255),
        impression: '',
        memo: book.memo || '',
        isPublicMemo: false,
        finished: parseFinishedDate(book.finished),
      })
    }

    if (data.length > 0) {
      await prisma.books.createMany({ data })
    }

    return res.status(200).json({
      result: true,
      format: parsed.format,
      sheetName: name,
      imported: data.length,
      total: parsed.books.length + parsed.invalidLines.length,
      skipped,
    })
  } catch (error) {
    console.error('Bookmeter CSV import error:', error)
    return res
      .status(500)
      .json({ result: false, message: 'インポート処理に失敗しました' })
  }
}

/** ISBN10ならISBN13へ変換する */
const toISBN13 = (isbn: string): string =>
  isbn.length === 10 ? convertISBN10to13(isbn) : isbn

/** 読了日(YYYY/MM/DD)をDateに変換する。不正な値はnull */
const parseFinishedDate = (value?: string): Date | null => {
  if (!value) return null
  const date = new Date(value)
  return isNaN(date.getTime()) ? null : date
}

/**
 * openBD APIでISBN13のリストをまとめて書籍情報に解決する
 * https://api.openbd.jp/v1/get はISBNのカンマ区切り一括問い合わせに対応しており、
 * レスポンス配列はリクエストしたISBNと同順で返る(見つからない場合はnull)
 */
const fetchOpenBDBooks = async (
  isbn13List: string[]
): Promise<Map<string, BookInfo>> => {
  const map = new Map<string, BookInfo>()

  for (let i = 0; i < isbn13List.length; i += OPENBD_CHUNK_SIZE) {
    const chunk = isbn13List.slice(i, i + OPENBD_CHUNK_SIZE)
    try {
      const res = await fetch(`${OPENBD_API_URL}?isbn=${chunk.join(',')}`)
      if (!res.ok) continue
      const items = await res.json()
      if (!Array.isArray(items)) continue

      items.forEach((item, index) => {
        const summary = item?.summary
        if (!summary) return
        map.set(chunk[index], {
          title: summary.title || '',
          author: summary.author || '',
          category:
            item.onix?.DescriptiveDetail?.Subject?.[0]?.SubjectHeadingText ||
            '未分類',
          image: summary.cover
            ? summary.cover.replace('http:', 'https:')
            : NO_IMAGE,
        })
      })
    } catch (error) {
      console.error('openBD API error:', error)
    }
  }

  return map
}
