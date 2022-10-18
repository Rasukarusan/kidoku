import nookies from 'nookies'
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { myhash } = nookies.get({ req })
  if (!myhash) {
    res.status(200).json(false)
  }
  const isOk = process.env.MY_HASH ? process.env.MY_HASH === myhash : false
  res.status(200).json(isOk)
}
