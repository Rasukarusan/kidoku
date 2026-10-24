import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import prisma from '@/libs/prisma'

// One row per item. Collections, attributes and complete repeated histories are
// encoded as JSON cells, so membership cannot duplicate the exported items.
const cell = (value: unknown) => {
  let text = typeof value === 'string' ? value : JSON.stringify(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  res.setHeader('Cache-Control', 'private, no-store')
  const items = await prisma.item.findMany({
    where: { userId: session.user.id },
    include: {
      collections: {
        select: { collection: { select: { id: true, name: true } } },
      },
      logs: { orderBy: { id: 'asc' } },
    },
    orderBy: { id: 'asc' },
  })
  const data = items.map(({ collections, ...item }) => ({
    ...item,
    collections: collections.map((link) => link.collection),
  }))
  if (req.query.format === 'json') {
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="kidoku-items.json"'
    )
    return res.json({
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      items: data,
    })
  }
  const columns = [
    'id',
    'itemTypeId',
    'title',
    'imageUrl',
    'category',
    'rating',
    'memo',
    'isPublicMemo',
    'attributes',
    'attributesVersion',
    'collections',
    'logs',
    'createdAt',
    'updatedAt',
  ] as const
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="kidoku-items.csv"'
  )
  return res.send(
    '\uFEFF' +
      [
        columns.join(','),
        ...data.map((item) =>
          columns.map((column) => cell(item[column])).join(',')
        ),
      ].join('\r\n')
  )
}
