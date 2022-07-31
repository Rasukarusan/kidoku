import nookies from 'nookies'
import crypto from 'crypto'
import type { NextApiRequest, NextApiResponse } from 'next'
import { COOKIE_KEY_HASH } from '@/libs/constants'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const pass = req.query.pass as string
  if (!pass) {
    return res.status(400).json(false)
  }
  const hash = crypto.createHash('sha256').update(pass, 'utf8').digest('hex')
  const isAuth = process.env.MY_HASH === hash
  if (isAuth) {
    nookies.set({ res }, COOKIE_KEY_HASH, hash, {
      maxAge: 10 * 12 * 30 * 24 * 60 * 60, // 10年間
      path: '/',
    })
  }
  return res.status(200).json(isAuth)
}
