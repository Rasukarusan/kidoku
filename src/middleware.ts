import { NextRequest, NextResponse } from 'next/server'
import { basicAuth } from '@/middlewares/basicAuth'

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/sheet')) {
    return basicAuth(req)
  }
  return NextResponse.next()
}
