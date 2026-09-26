import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCurrentUserAndProfile } from '@/lib/auth'

export default async function HomePage() {
  const cookieStore = await cookies()
  const { user, profile } = await getCurrentUserAndProfile(cookieStore)

  if (!user) redirect('/login')

  const role = profile?.role

  if (role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN') redirect('/admin')
  if (role === 'TEACHER') redirect('/teacher')
  if (role === 'STUDENT') redirect('/student')

  // Fallback
  redirect('/login')
}
