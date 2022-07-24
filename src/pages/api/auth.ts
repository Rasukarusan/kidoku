import nookies from 'nookies'
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { myhash } = nookies.get({ req })
  const isOk = process.env.MY_HASH === myhash
  res.status(200).json(isOk)
}
