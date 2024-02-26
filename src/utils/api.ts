import type { NextApiRequest } from 'next'
import { NextRequest } from 'next/server'
export const isAdmin = (req: NextApiRequest | NextRequest) => {
  // @ts-expect-error runtime = 'edge'を考慮した下記の形式だと、型エラーが出てしまうので無視
  const authToken = (req.headers.get('authorization') || '')
    .split('Bearer ')
    .at(1)
  return authToken && authToken === process.env.ADMIN_AUTH_TOKEN
}
