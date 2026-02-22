import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { graphqlClient } from '@/libs/graphql/backend-client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // セッション情報を取得
    const session = await getServerSession(req, res, authOptions)

    const { query, variables } = req.body

    // 未認証の場合は公開APIとして転送
    if (!session?.user?.id) {
      const data = await graphqlClient.executePublic(query, variables)
      return res.status(200).json({ data })
    }

    const userId = session.user.id
    const isAdmin = session.user.admin || false

    // GraphQLクライアントを使用してリクエストを転送
    const data = await graphqlClient.execute(userId, query, variables, isAdmin)

    return res.status(200).json({ data })
  } catch (error) {
    console.error('GraphQL proxy error:', error)
    return res.status(500).json({
      errors: [
        {
          message: 'Internal server error',
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      ],
    })
  }
}

// Next.jsのbodyパーサーを無効化（GraphQLのリクエストボディをそのまま扱うため）
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}
