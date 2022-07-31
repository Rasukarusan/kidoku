import nookies from 'nookies'
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  nookies.destroy({ res }, 'myhash')
  return res.status(200).json(true)
}
