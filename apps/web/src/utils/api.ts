import type { NextApiRequest } from 'next'
import type { NextRequest } from 'next/server'

export const isAdmin = (req: NextApiRequest | NextRequest) => {
  let authToken: string | undefined
  // Edge Runtime の場合 (req.headers.get がある)
  if (
    'headers' in req &&
    typeof (req as NextRequest).headers.get === 'function'
  ) {
    authToken =
      (req as NextRequest).headers
        .get('authorization')
        .split('Bearer ')
        .at(1) || ''
  }
  // Node.js Runtime の場合 (headers はオブジェクト)
  else if (
    'headers' in req &&
    typeof (req as NextApiRequest).headers === 'object'
  ) {
    authToken =
      (req as NextApiRequest).headers['authorization'].split('Bearer ').at(1) ||
      '' ||
      ''
  }
  return authToken && authToken === process.env.ADMIN_AUTH_TOKEN
}
