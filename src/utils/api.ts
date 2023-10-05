import type { NextApiRequest } from 'next'
export const isAdmin = (req: NextApiRequest) => {
  const authToken = (req.headers.authorization || '').split('Bearer ').at(1)
  console.log({ authToken })
  return authToken && authToken === process.env.ADMIN_AUTH_TOKEN
}
