import crypto from 'crypto'
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const pass = req.query.pass as string
  if (!pass) {
    return res.status(400).json('passを指定してください')
  }
  const hashHex = crypto.createHash('sha256').update(pass, 'utf8').digest('hex')
  // nookies.set({ res }, 'myhash', hashHex, {
  //   maxAge: 10 * 12 * 30 * 24 * 60 * 60, // 10年間
  //   path: '/',
  // })
  res.status(200).json(hashHex)
}
