import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'

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
    
    // NestJS GraphQLエンドポイント
    const graphqlEndpoint = process.env.NESTJS_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql'
    
    // リクエストヘッダーの準備
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    // NextAuthのセッション情報を基に認証ヘッダーを設定
    // NestJS側では、このユーザーIDを使って認証を行う
    if (session?.user?.id) {
      // セッション情報をJSON形式でヘッダーに含める
      // NestJS側でこの情報を解析して認証処理を行う
      headers['X-User-Id'] = session.user.id
      headers['X-User-Admin'] = String(session.user.admin || false)
      
      // 必要に応じてJWTトークンを生成することも可能
      // ただし、現在のシステムではセッションベースの認証を使用
    }
    
    // NestJSのGraphQLエンドポイントにプロキシ
    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
    })
    
    // レスポンスのステータスコードをチェック
    if (!response.ok) {
      const errorText = await response.text()
      console.error('GraphQL proxy error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      return res.status(response.status).json({
        errors: [{
          message: `GraphQL server error: ${response.statusText}`,
          extensions: {
            code: 'GRAPHQL_PROXY_ERROR',
            statusCode: response.status,
          }
        }]
      })
    }
    
    // 成功レスポンスを返す
    const data = await response.json()
    return res.status(200).json(data)
    
  } catch (error) {
    console.error('GraphQL proxy error:', error)
    return res.status(500).json({
      errors: [{
        message: 'Internal server error',
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }]
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