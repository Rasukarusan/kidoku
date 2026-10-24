import { createHash } from 'crypto'
import type { NextApiRequest } from 'next'
import prisma from '@/libs/prisma'

export async function personalAccessTokenUser(
  req: NextApiRequest
): Promise<string | null> {
  if (!req.headers.authorization?.startsWith('Bearer ')) return null
  const tokenHash = createHash('sha256')
    .update(req.headers.authorization.slice(7).trim())
    .digest('hex')
  const token = await prisma.personalAccessToken.findUnique({
    where: { tokenHash },
  })
  if (!token) return null
  await prisma.personalAccessToken.update({
    where: { id: token.id },
    data: { lastUsedAt: new Date() },
  })
  return token.userId
}
