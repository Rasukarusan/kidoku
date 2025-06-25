import { NextRequest, NextResponse } from 'next/server'

// メトリクス収集用のヘルパー
async function collectMetrics(request: NextRequest, response: NextResponse) {
  const startTime = Date.now()
  const method = request.method
  const pathname = request.nextUrl.pathname

  // レスポンスのステータスコードを取得（デフォルトは200）
  const statusCode = response.status || 200
  const duration = (Date.now() - startTime) / 1000 // 秒単位

  // メトリクスAPIにデータを送信（非同期で実行）
  try {
    const metricsData = {
      method,
      route: pathname,
      statusCode,
      duration,
    }

    // メトリクス収集は失敗してもアプリケーションに影響しないようにする
    fetch(`${request.nextUrl.origin}/api/internal/metrics/collect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metricsData),
    }).catch(() => {
      // エラーは無視
    })
  } catch (error) {
    // メトリクス収集のエラーは無視
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // メトリクスエンドポイント自体は計測しない
  if (
    pathname === '/api/metrics' ||
    pathname === '/api/internal/metrics/collect'
  ) {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  // メトリクス収集（非同期）
  collectMetrics(request, response)

  return response
}

// 認証が必要なパスの設定
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - api/metrics (metrics endpoint)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|api/metrics|_next/static|_next/image|favicon.ico).*)',
  ],
}
