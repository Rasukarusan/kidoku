import nookies from 'nookies'
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { myhash } = nookies.get({ req })
    if (!myhash) {
      return res.status(200).json(false)
    }
    const isOk = process.env.MY_HASH ? process.env.MY_HASH === myhash : false
    return res.status(200).json(isOk)
  } catch (e) {
    return res.status(400).json(false)
  }
}
