import crypto from 'crypto'

/**
 * NestJS GraphQLバックエンドへのクライアント
 * HMAC-SHA256署名を使用した認証を自動的に行う
 */
export class GraphQLBackendClient {
  private readonly endpoint: string
  private readonly secretKey: string

  constructor(endpoint?: string, secretKey?: string) {
    this.endpoint =
      endpoint ||
      process.env.NESTJS_GRAPHQL_ENDPOINT ||
      'http://localhost:4000/graphql'
    this.secretKey = secretKey || process.env.NEXTAUTH_SECRET || ''

    if (!this.secretKey) {
      throw new Error('NEXTAUTH_SECRET is not configured')
    }
  }

  /**
   * HMAC-SHA256署名を生成
   */
  private generateSignature(
    userId: string,
    isAdmin: boolean,
    timestamp: string
  ): string {
    const signaturePayload = `${userId}:${isAdmin}:${timestamp}`
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(signaturePayload)
      .digest('hex')
  }

  /**
   * GraphQLリクエストを実行
   */
  async execute<T = any>(
    userId: string,
    query: string,
    variables?: Record<string, any>,
    isAdmin = false
  ): Promise<T> {
    const timestamp = Date.now().toString()
    const signature = this.generateSignature(userId, isAdmin, timestamp)

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
        'X-User-Admin': String(isAdmin),
        'X-Timestamp': timestamp,
        'X-Signature': signature,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('GraphQL request failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      throw new Error(`GraphQL request failed: ${response.statusText}`)
    }

    const result = await response.json()

    // GraphQLエラーチェック
    if (result.errors) {
      console.error('GraphQL errors:', result.errors)
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`)
    }

    return result.data
  }
}

/**
 * デフォルトクライアントインスタンス
 */
export const graphqlClient = new GraphQLBackendClient()
