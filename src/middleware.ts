import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Let the Supabase middleware refresh the session token on every request
  const response = createClient(request)

  // If the user is signed in and visits /login, redirect them to admin
  const { pathname } = request.nextUrl

  // Allow public paths to pass through
  const publicPaths = ['/login', '/_next', '/favicon.ico', '/api']
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return response
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
