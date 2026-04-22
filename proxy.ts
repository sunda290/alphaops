import { NextRequest, NextResponse } from 'next/server'

const ROTAS_PROTEGIDAS_ADMIN = ['/admin', '/assistente']
const ROTAS_PROTEGIDAS_PONTA = ['/ponta-de-lanca']
const ROTAS_AUTH = ['/login', '/signup']

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('alphaops-token')?.value
  const role  = req.cookies.get('alphaops-role')?.value

  if (ROTAS_PROTEGIDAS_ADMIN.some(r => pathname.startsWith(r))) {
    if (!token || role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  if (ROTAS_PROTEGIDAS_PONTA.some(r => pathname.startsWith(r))) {
    if (!token || (role !== 'ponta_de_lanca' && role !== 'admin')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  if (ROTAS_AUTH.includes(pathname) && token) {
    if (role === 'admin') return NextResponse.redirect(new URL('/admin', req.url))
    if (role === 'ponta_de_lanca') return NextResponse.redirect(new URL('/ponta-de-lanca', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/assistente/:path*',
    '/ponta-de-lanca/:path*',
    '/login',
    '/signup',
  ],
}
