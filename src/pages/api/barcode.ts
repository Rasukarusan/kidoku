import type { NextApiRequest, NextApiResponse } from 'next'
import { kv } from '@vercel/kv'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      res.status(401).json({ result: false })
    }
    if (req.method === 'GET') {
      const id = session.user.id
      const book = await kv.get(`${id}_barcode`)
      await kv.del(`${id}_barcode`)
      return res.status(200).json({ result: true, book })
    }
    if (req.method === 'POST') {
      const body = JSON.parse(req.body)
      const { book } = body
      const id = session.user.id
      console.log(book, id)
      await kv.set(`${id}_barcode`, book, { ex: 100, nx: true })
      return res.status(200).json(true)
    }
  } catch (e) {
    console.log(e)
    return res.status(400).json(false)
  }
}
