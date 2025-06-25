import { NextRequest, NextResponse } from 'next/server'
import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client'

// デフォルトメトリクスの収集（CPU、メモリ使用率など）
collectDefaultMetrics({ register })

// カスタムメトリクスの定義
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
})

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register]
})

const activeUsersGauge = new Gauge({
  name: 'kidoku_active_users',
  help: 'Number of active users',
  registers: [register]
})

const booksRegisteredTotal = new Counter({
  name: 'kidoku_books_registered_total',
  help: 'Total number of books registered',
  registers: [register]
})

const aiAnalysisRequestsTotal = new Counter({
  name: 'kidoku_ai_analysis_requests_total',
  help: 'Total number of AI analysis requests',
  labelNames: ['ai_provider', 'status'],
  registers: [register]
})

// メトリクスエクスポートAPI
export async function GET(request: NextRequest) {
  try {
    // Prometheusフォーマットでメトリクスを返す
    const metrics = await register.metrics()
    
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': register.contentType,
      },
    })
  } catch (error) {
    console.error('Error collecting metrics:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// メトリクスヘルパー関数をエクスポート（他のAPIルートから使用可能）
export const metricsHelpers = {
  incrementHttpRequests: (method: string, route: string, statusCode: number) => {
    httpRequestsTotal.inc({ method, route, status_code: statusCode.toString() })
  },
  
  recordHttpDuration: (method: string, route: string, statusCode: number, duration: number) => {
    httpRequestDuration.observe({ method, route, status_code: statusCode.toString() }, duration)
  },
  
  setActiveUsers: (count: number) => {
    activeUsersGauge.set(count)
  },
  
  incrementBooksRegistered: () => {
    booksRegisteredTotal.inc()
  },
  
  incrementAIAnalysisRequests: (provider: string, status: 'success' | 'failure') => {
    aiAnalysisRequestsTotal.inc({ ai_provider: provider, status })
  },
}