
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { rateLimit } from './lib/utils/rate-limit'

export default withAuth(
  async function middleware(req) {
    // Apply rate limiting to API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1'
      const response = await rateLimit(ipAddress)
      if (response) return response
    }

    // Add security headers
    const response = NextResponse.next()
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    return response
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/api/:path*',
    '/profile/:path*',
    '/threads/:path*',
  ],
}
