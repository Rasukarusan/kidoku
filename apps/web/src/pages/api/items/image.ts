import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { put } from '@vercel/blob'
import { randomUUID } from 'crypto'
import { bufferToWebp } from '@/libs/sharp/bufferToWebp'

export const config = { api: { bodyParser: { sizeLimit: '3mb' } } }
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'ログインしてください' })
  try {
    const image = req.body?.image
    if (
      typeof image !== 'string' ||
      !/^data:image\/(png|jpeg|webp|gif);base64,/.test(image)
    )
      return res.status(400).json({ error: '画像形式が不正です' })
    const buffer = await bufferToWebp(
      Buffer.from(image.split(',')[1], 'base64')
    )
    const { url } = await put(`items/${randomUUID()}.webp`, buffer, {
      access: 'public',
    })
    return res.status(200).json({ url })
  } catch {
    return res.status(400).json({
      error: '画像を保存できませんでした。3MB以下の画像でお試しください。',
    })
  }
}
