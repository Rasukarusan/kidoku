import nookies from 'nookies'
import type { NextApiRequest, NextApiResponse } from 'next'
import { COOKIE_KEY_HASH } from '@/libs/constants'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  nookies.set({ res }, COOKIE_KEY_HASH, '', {
    maxAge: 0,
    path: '/',
  })
  return res.status(200).json(true)
}
