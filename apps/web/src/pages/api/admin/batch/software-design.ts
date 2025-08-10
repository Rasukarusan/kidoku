import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import crypto from 'crypto'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // POSTメソッドのみ許可
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 管理者認証の2つの方法をサポート
    // 1. ADMIN_AUTH_TOKENによる認証（CI/CDやcronジョブ用）
    const authHeader = req.headers.authorization
    const adminToken = process.env.ADMIN_AUTH_TOKEN

    if (authHeader === `Bearer ${adminToken}` && adminToken) {
      // ADMIN_AUTH_TOKENによる認証成功
      console.log('Admin authenticated via ADMIN_AUTH_TOKEN')
    } else {
      // 2. セッションによる認証（管理画面からの実行用）
      const session = await getServerSession(req, res, authOptions)

      if (!session?.user?.admin) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Admin access required',
        })
      }
      console.log(`Admin authenticated via session: ${session.user.id}`)
    }

    // NestJS GraphQLエンドポイント
    const nestjsEndpoint =
      process.env.NESTJS_GRAPHQL_ENDPOINT?.replace('/graphql', '') ||
      'http://localhost:4000'

    // NEXTAUTH_SECRETを内部API通信の署名に使用
    const secretKey = process.env.NEXTAUTH_SECRET
    if (!secretKey) {
      console.error('NEXTAUTH_SECRET is not configured')
      return res
        .status(500)
        .json({ error: 'Internal server configuration error' })
    }

    // 管理者として署名付きヘッダーを生成
    const userId = 'admin-batch'
    const isAdmin = 'true'
    const timestamp = Date.now().toString()

    // 署名対象のデータ
    const signaturePayload = `${userId}:${isAdmin}:${timestamp}`

    // HMAC-SHA256で署名を生成
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(signaturePayload)
      .digest('hex')

    // NestJSのバッチエンドポイントを呼び出し
    const response = await fetch(
      `${nestjsEndpoint}/software-design/batch/add-latest`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          'X-User-Admin': isAdmin,
          'X-Timestamp': timestamp,
          'X-Signature': signature,
        },
        body: JSON.stringify(req.body || {}),
      }
    )

    // レスポンスの処理
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Batch API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      return res.status(response.status).json({
        error: `Batch API error: ${response.statusText}`,
        details: errorText,
      })
    }

    const data = await response.json()
    return res.status(200).json({
      success: true,
      message: 'Batch job executed successfully',
      data,
    })
  } catch (error) {
    console.error('Batch API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}
