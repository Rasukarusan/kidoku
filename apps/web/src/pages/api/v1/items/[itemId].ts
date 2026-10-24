import type { NextApiRequest, NextApiResponse } from 'next'
import { personalAccessTokenUser } from '@/libs/auth/personal-access-token'
import { getPersonalItem } from '@/libs/collections/personal-items'
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'private, no-store')
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  const id = Number(req.query.itemId)
  if (!Number.isSafeInteger(id) || id <= 0)
    return res.status(400).json({ error: 'Invalid ID' })
  try {
    const userId = await personalAccessTokenUser(req)
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const item = await getPersonalItem(userId, id)
    return item
      ? res.json(item)
      : res.status(404).json({ error: 'Item not found' })
  } catch {
    return res.status(500).json({ error: 'Internal server error' })
  }
}
