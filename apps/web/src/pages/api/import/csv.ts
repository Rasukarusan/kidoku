import { readSheets, readBooks } from '@kidoku/reading-store'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import prisma from '@/libs/prisma'
import { parseCSV } from '@/utils/csv'
import { NO_IMAGE } from '@/libs/constants'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

const MAX_ROWS = 5000

// ヘッダー名のゆらぎを吸収するマッピング
const HEADER_ALIASES: Record<string, string[]> = {
  sheet: ['シート名', 'シート'],
  title: ['タイトル', '書名', '題名'],
  author: ['著者', '作者', '著者名'],
  category: ['カテゴリ', 'カテゴリー', 'ジャンル'],
  impression: ['評価', '感想記号'],
  memo: ['メモ', '感想', 'レビュー'],
  finished: ['読了日', '読了日付', '読み終わった日'],
}

function buildHeaderIndex(header: string[]): Record<string, number> {
  const index: Record<string, number> = {}
  header.forEach((raw, i) => {
    const name = raw.trim()
    Object.entries(HEADER_ALIASES).forEach(([key, aliases]) => {
      if (index[key] === undefined && aliases.includes(name)) {
        index[key] = i
      }
    })
  })
  return index
}

function parseDate(value: string): Date | null {
  if (!value?.trim()) return null
  const normalized = value.trim().replace(/\//g, '-')
  const date = new Date(normalized)
  return isNaN(date.getTime()) ? null : date
}

// エクスポートCSV（および互換形式）から読書記録を書き戻すインポートAPI
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const userId = session.user.id

  try {
    const { csv } = req.body as { csv?: string }
    if (!csv || typeof csv !== 'string') {
      return res.status(400).json({ error: 'CSVデータがありません' })
    }

    const rows = parseCSV(csv)
    if (rows.length < 2) {
      return res.status(400).json({ error: 'ヘッダー行とデータ行が必要です' })
    }

    const headerIndex = buildHeaderIndex(rows[0])
    if (headerIndex.title === undefined) {
      return res.status(400).json({
        error:
          'タイトル列が見つかりません。ヘッダー行に「タイトル」列を含めてください',
      })
    }

    const dataRows = rows.slice(1)
    if (dataRows.length > MAX_ROWS) {
      return res
        .status(400)
        .json({ error: `一度にインポートできるのは${MAX_ROWS}件までです` })
    }

    const pick = (row: string[], key: string): string => {
      const i = headerIndex[key]
      return i === undefined ? '' : (row[i] ?? '').trim()
    }

    // 既存シートを取得
    const existingSheets = await readSheets(prisma, {
      where: { userId },
      orderBy: { position: 'asc' },
    })
    const sheetIdByName = new Map(existingSheets.map((s) => [s.name, s.id]))
    let nextOrder =
      existingSheets.length > 0
        ? Math.max(...existingSheets.map((s) => s.order ?? 0)) + 1
        : 1

    // 既存の本（シートID+タイトル）で重複判定
    const existingBooks = await readBooks(prisma, { filter: { userId } })
    const existingKeys = new Set(
      existingBooks.map((b) => `${b.sheetId}\u0000${b.title}`)
    )

    let imported = 0
    let skipped = 0
    let createdSheets = 0

    for (const row of dataRows) {
      const title = pick(row, 'title')
      if (!title) {
        skipped++
        continue
      }
      const finished = parseDate(pick(row, 'finished'))
      // シート名が無い場合は読了日の年、それも無ければ「インポート」
      const sheetName =
        pick(row, 'sheet') ||
        (finished ? String(finished.getFullYear()) : 'インポート')

      let sheetId = sheetIdByName.get(sheetName)
      if (!sheetId) {
        const sheet = await prisma.collection.create({
          data: {
            userId,
            name: sheetName,
            position: nextOrder++,
            description: '',
          },
        })
        sheetIdByName.set(sheetName, sheet.id)
        sheetId = sheet.id
        createdSheets++
      }

      const key = `${sheetId}\u0000${title}`
      if (existingKeys.has(key)) {
        skipped++
        continue
      }

      await prisma.item.create({
        data: {
          userId,
          itemTypeId: 'book',
          collections: { create: { collectionId: sheetId } },
          title: title.slice(0, 120),
          attributes: { authors: [pick(row, 'author').slice(0, 120) || '-'] },
          category: pick(row, 'category').slice(0, 120) || '-',
          imageUrl: NO_IMAGE,
          rating: pick(row, 'impression').slice(0, 5) || '-',
          memo: pick(row, 'memo'),
          isPublicMemo: false,
          ...(finished
            ? {
                logs: {
                  create: { kind: 'read', occurredAt: finished, memo: '' },
                },
              }
            : {}),
        },
      })
      existingKeys.add(key)
      imported++
    }

    return res.status(200).json({
      result: true,
      imported,
      skipped,
      createdSheets,
    })
  } catch (error) {
    console.error('CSV import error:', error)
    return res.status(500).json({ error: 'インポートに失敗しました' })
  }
}
