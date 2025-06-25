import { Counter, Histogram, Gauge, register } from 'prom-client'

// カスタムメトリクスの定義
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
})

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
})

const activeUsersGauge = new Gauge({
  name: 'kidoku_active_users',
  help: 'Number of active users',
  registers: [register],
})

const booksRegisteredTotal = new Counter({
  name: 'kidoku_books_registered_total',
  help: 'Total number of books registered',
  registers: [register],
})

const aiAnalysisRequestsTotal = new Counter({
  name: 'kidoku_ai_analysis_requests_total',
  help: 'Total number of AI analysis requests',
  labelNames: ['ai_provider', 'status'],
  registers: [register],
})

// メトリクスヘルパー関数
export const metricsHelpers = {
  incrementHttpRequests: (
    method: string,
    route: string,
    statusCode: number
  ) => {
    httpRequestsTotal.inc({ method, route, status_code: statusCode.toString() })
  },

  recordHttpDuration: (
    method: string,
    route: string,
    statusCode: number,
    duration: number
  ) => {
    httpRequestDuration.observe(
      { method, route, status_code: statusCode.toString() },
      duration
    )
  },

  setActiveUsers: (count: number) => {
    activeUsersGauge.set(count)
  },

  incrementBooksRegistered: () => {
    booksRegisteredTotal.inc()
  },

  incrementAIAnalysisRequests: (
    provider: string,
    status: 'success' | 'failure'
  ) => {
    aiAnalysisRequestsTotal.inc({ ai_provider: provider, status })
  },
}
