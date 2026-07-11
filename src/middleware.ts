import { NextRequest, NextResponse } from 'next/server'

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/orders',
  '/messages',
  '/settings',
  '/earnings',
  '/gigs/create',
  '/gigs/edit',
  '/resolution',
]

// Routes only for guests (redirect if logged in)
const GUEST_ROUTES = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('nolance-token')?.value

  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))
  const isGuestOnly = GUEST_ROUTES.some(r => pathname.startsWith(r))

  if (isProtected && !token) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isGuestOnly && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}
