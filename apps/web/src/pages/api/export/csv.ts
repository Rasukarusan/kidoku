import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import prisma from '@/libs/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const userId = session.user.id

    // ユーザーのシートと本のデータを取得
    const sheets = await prisma.sheets.findMany({
      where: { userId },
      include: {
        books: {
          orderBy: { finished: 'desc' },
        },
      },
      orderBy: { order: 'asc' },
    })

    // CSVヘッダー
    const csvHeaders = [
      'シート名',
      'タイトル',
      '著者',
      'カテゴリ',
      '評価',
      'メモ',
      '読了日',
      '登録日',
      '更新日',
    ]

    // CSVデータの生成
    const csvRows: string[] = [csvHeaders.join(',')]

    sheets.forEach((sheet) => {
      sheet.books.forEach((book) => {
        const row = [
          escapeCSV(sheet.name),
          escapeCSV(book.title),
          escapeCSV(book.author),
          escapeCSV(book.category),
          escapeCSV(book.impression),
          escapeCSV(book.memo),
          book.finished ? formatDate(book.finished) : '',
          formatDate(book.created),
          formatDate(book.updated),
        ]
        csvRows.push(row.join(','))
      })
    })

    const csv = csvRows.join('\n')

    // UTF-8 BOM付きでCSVを送信（Excelでの文字化け対策）
    const bom = Buffer.from('\uFEFF', 'utf-8')
    const csvBuffer = Buffer.concat([bom, Buffer.from(csv, 'utf-8')])

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="kidoku_export_${new Date().toISOString().split('T')[0]}.csv"`
    )
    res.send(csvBuffer)
  } catch (error) {
    console.error('CSV export error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// CSV用のエスケープ処理
function escapeCSV(str: string): string {
  if (!str) return ''

  // ダブルクォートをエスケープ
  const escaped = str.replace(/"/g, '""')

  // カンマ、改行、ダブルクォートが含まれている場合はダブルクォートで囲む
  if (
    escaped.includes(',') ||
    escaped.includes('\n') ||
    escaped.includes('\r') ||
    escaped.includes('"')
  ) {
    return `"${escaped}"`
  }

  return escaped
}

// 日付フォーマット
function formatDate(date: Date): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}
