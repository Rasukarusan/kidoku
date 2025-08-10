import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import crypto from 'crypto'

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
    
    // NEXTAUTH_SECRETを内部API通信の署名にも使用
    const secretKey = process.env.NEXTAUTH_SECRET
    if (!secretKey) {
      console.error('NEXTAUTH_SECRET is not configured')
      return res.status(500).json({ error: 'Internal server configuration error' })
    }
    
    // リクエストヘッダーの準備
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    // NextAuthのセッション情報を基に認証ヘッダーを設定
    if (session?.user?.id) {
      // ユーザー情報
      const userId = session.user.id
      const isAdmin = String(session.user.admin || false)
      
      // タイムスタンプ（リプレイ攻撃防止）
      const timestamp = Date.now().toString()
      
      // 署名対象のデータ
      const signaturePayload = `${userId}:${isAdmin}:${timestamp}`
      
      // HMAC-SHA256で署名を生成
      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(signaturePayload)
        .digest('hex')
      
      // ヘッダーに設定
      headers['X-User-Id'] = userId
      headers['X-User-Admin'] = isAdmin
      headers['X-Timestamp'] = timestamp
      headers['X-Signature'] = signature
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