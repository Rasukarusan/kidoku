import { NextResponse } from 'next/server'
import { register, collectDefaultMetrics } from 'prom-client'

// デフォルトメトリクスの収集（CPU、メモリ使用率など）
collectDefaultMetrics({ register })

// メトリクスエクスポートAPI
export async function GET() {
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
