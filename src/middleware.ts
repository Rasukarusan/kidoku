import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: '/sheet',
}

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization')
  const url = req.nextUrl

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    if (
      user === process.env.BASIC_AUTH_USER &&
      pwd === process.env.BASIC_AUTH_PASS
    ) {
      return NextResponse.next()
    }
  }
  url.pathname = '/api/auth'

  return NextResponse.rewrite(url)
}
