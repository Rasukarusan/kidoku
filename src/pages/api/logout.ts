import nookies from 'nookies'
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  nookies.set({ res }, 'myhash', '', {
    maxAge: -1,
    path: '/',
  })
  res.status(200).json(true)
}
