import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  success: boolean
  message: string
}

// このAPIはNestJSに移行しました
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  return res.status(410).json({
    success: false,
    message: 'This API has been migrated to NestJS. Please use GraphQL endpoint instead.',
  })
}
