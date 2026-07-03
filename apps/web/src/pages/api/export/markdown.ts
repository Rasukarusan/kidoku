import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import prisma from '@/libs/prisma'
import JSZip from 'jszip'

// ファイル名に使えない文字を置換
function safeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_').slice(0, 80)
}

function formatDate(date: Date | null): string {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 全蔵書を1冊=1ファイルのMarkdown(frontmatter付き)でzipエクスポート。
// Obsidian/Notionなどの知的生産ツールへの取り込みを想定している。
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
    const sheets = await prisma.sheets.findMany({
      where: { userId: session.user.id },
      include: {
        books: {
          orderBy: { finished: 'desc' },
          include: { quotes: { orderBy: [{ page: 'asc' }] } },
        },
      },
      orderBy: { order: 'asc' },
    })

    const zip = new JSZip()
    const usedNames = new Set<string>()

    sheets.forEach((sheet) => {
      const folder = zip.folder(safeFileName(sheet.name))
      if (!folder) return
      sheet.books.forEach((book) => {
        let base = safeFileName(book.title) || `book-${book.id}`
        if (usedNames.has(`${sheet.name}/${base}`)) {
          base = `${base}-${book.id}`
        }
        usedNames.add(`${sheet.name}/${base}`)

        const frontmatter = [
          '---',
          `title: "${book.title.replace(/"/g, '\\"')}"`,
          `author: "${book.author.replace(/"/g, '\\"')}"`,
          `category: "${book.category.replace(/"/g, '\\"')}"`,
          `impression: "${book.impression}"`,
          `sheet: "${sheet.name.replace(/"/g, '\\"')}"`,
          book.finished ? `finished: ${formatDate(book.finished)}` : null,
          `created: ${formatDate(book.created)}`,
          '---',
        ]
          .filter(Boolean)
          .join('\n')

        const quoteSection =
          book.quotes.length > 0
            ? '\n\n## 引用\n\n' +
              book.quotes
                .map((quote) => {
                  const page = quote.page ? ` (P.${quote.page})` : ''
                  const comment = quote.comment ? `\n  - ${quote.comment}` : ''
                  return `> ${quote.text.replace(/\n/g, '\n> ')}${page}${comment}`
                })
                .join('\n\n')
            : ''

        const content = `${frontmatter}\n\n# ${book.title}\n\n${book.memo}${quoteSection}\n`
        folder.file(`${base}.md`, content)
      })
    })

    const buffer = await zip.generateAsync({ type: 'nodebuffer' })

    res.setHeader('Content-Type', 'application/zip')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="kidoku_markdown_${new Date().toISOString().split('T')[0]}.zip"`
    )
    return res.send(buffer)
  } catch (error) {
    console.error('Markdown export error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
