import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const adminSession = request.cookies.get('asyar_admin_session')?.value

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (adminSession !== 'authenticated_admin') {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  if (pathname === '/admin/login' && adminSession === 'authenticated_admin') {
    const dashboardUrl = new URL('/admin/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  if (pathname === '/admin') {
    const targetUrl = new URL(
      adminSession === 'authenticated_admin' ? '/admin/dashboard' : '/admin/login',
      request.url
    )
    return NextResponse.redirect(targetUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
