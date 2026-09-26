import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export interface UserProfile {
  id: string
  email: string
  role: string
  first_name?: string | null
  last_name?: string | null
}

export async function getCurrentUserAndProfile(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  // 1. Check demo user cookie for local preview
  const demoCookie = cookieStore.get('demo_user')
  if (demoCookie?.value) {
    try {
      const demoUser = JSON.parse(demoCookie.value)
      return {
        user: { id: 'demo-' + demoUser.role, email: demoUser.email },
        profile: {
          id: 'demo-' + demoUser.role,
          email: demoUser.email,
          role: demoUser.role,
          first_name: demoUser.first_name ?? 'Demo',
          last_name: demoUser.last_name ?? 'User',
        } as UserProfile
      }
    } catch {
      // Fall through to Supabase auth check
    }
  }

  // 2. Check Supabase auth session
  const supabase = createClient(cookieStore)
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    user = null
  }

  if (!user) return { user: null, profile: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, first_name, last_name, email')
    .eq('id', user.id)
    .single()

  return {
    user,
    profile: (profile as UserProfile | null) ?? {
      id: user.id,
      email: user.email ?? '',
      role: 'STUDENT',
      first_name: 'User',
      last_name: '',
    }
  }
}
