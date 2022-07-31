import { destroyCookie } from 'nookies'
import type { NextApiRequest, NextApiResponse } from 'next'
import { COOKIE_KEY_HASH } from '@/libs/constants'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  destroyCookie({ res }, COOKIE_KEY_HASH)
  res.status(200).json(true)
}
