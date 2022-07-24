import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { pass } = req.query
  if (!pass) {
    res.status(400).json('passを指定してください')
  }
  const hashHex = crypto.createHash('sha256').update(pass, 'utf8').digest('hex')
  res.status(200).json(hashHex)
}
