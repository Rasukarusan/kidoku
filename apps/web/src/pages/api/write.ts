import type { NextApiRequest, NextApiResponse } from 'next'
import { GAS_ENDPOINT } from '@/libs/constants'

/**
 * GASのPOSTエンドポイントを叩く
 *
 * クライアントから叩くとCORSエラーとなり、現状のGASの仕様上回避策がないためサーバーから叩く
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await fetch(GAS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(req.body),
  })
    .then((res) => res.json())
    .then((json) => json)
  res.status(200).json(true)
}
