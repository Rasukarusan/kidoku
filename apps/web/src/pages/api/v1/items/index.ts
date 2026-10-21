import type { NextApiRequest, NextApiResponse } from 'next'
import { personalAccessTokenUser } from '@/libs/auth/personal-access-token'
import { listPersonalItems } from '@/libs/collections/personal-items'
import { parsePagination } from '@/utils/pagination'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'private, no-store')
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  const pagination = parsePagination(req.query)
  if ('error' in pagination) return res.status(400).json(pagination)
  const { query, itemTypeId, collectionId } = req.query
  if (
    (query !== undefined &&
      (typeof query !== 'string' || query.length > 200)) ||
    (itemTypeId !== undefined &&
      (typeof itemTypeId !== 'string' || itemTypeId.length > 40)) ||
    (collectionId !== undefined &&
      (typeof collectionId !== 'string' ||
        !/^\d+$/.test(collectionId) ||
        Number(collectionId) <= 0))
  )
    return res.status(400).json({ error: 'Invalid filters' })
  try {
    const userId = await personalAccessTokenUser(req)
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    return res.json(
      await listPersonalItems(userId, pagination, {
        query: query as string,
        itemTypeId: itemTypeId as string,
        collectionId: collectionId ? Number(collectionId) : undefined,
      })
    )
  } catch {
    return res.status(500).json({ error: 'Internal server error' })
  }
}
