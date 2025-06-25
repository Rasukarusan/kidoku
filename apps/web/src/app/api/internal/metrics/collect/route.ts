import { NextRequest, NextResponse } from 'next/server'
import { metricsHelpers } from '@/app/api/metrics/route'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { method, route, statusCode, duration } = data
    
    // メトリクスを記録
    metricsHelpers.incrementHttpRequests(method, route, statusCode)
    metricsHelpers.recordHttpDuration(method, route, statusCode, duration)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error collecting metrics:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}