import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  const supabaseResponse = createClient(request)

  const demoCookie = request.cookies.get('demo_user')
  let demoUser: { role: string } | null = null
  if (demoCookie?.value) {
    try {
      demoUser = JSON.parse(demoCookie.value)
    } catch {
      demoUser = null
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {},
      },
    }
  )

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    user = null
  }

  const { pathname } = request.nextUrl

  // If not authenticated (neither Supabase user nor demo cookie) and not on login page, redirect to login
  if (!user && !demoUser && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If authenticated and on login page, redirect to dashboard
  if ((user || demoUser) && pathname === '/login') {
    let role = demoUser?.role
    if (!role && user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      role = profile?.role ?? 'STUDENT'
    }

    if (role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url))
    } else if (role === 'TEACHER') {
      return NextResponse.redirect(new URL('/teacher', request.url))
    } else {
      return NextResponse.redirect(new URL('/student', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
