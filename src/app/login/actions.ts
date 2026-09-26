'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

const DEMO_ACCOUNTS: Record<string, { password: string; role: string; firstName: string; lastName: string }> = {
  'admin@lms.com': { password: 'admin123', role: 'SUPER_ADMIN', firstName: 'System', lastName: 'Admin' },
  'admin@school.edu': { password: 'Admin@1234', role: 'SUPER_ADMIN', firstName: 'Super', lastName: 'Admin' },
  'teacher1@school.edu': { password: 'Teacher@1234', role: 'TEACHER', firstName: 'Sarah', lastName: 'Johnson' },
  'teacher2@school.edu': { password: 'Teacher@1234', role: 'TEACHER', firstName: 'Ahmed', lastName: 'Khan' },
  'student1@school.edu': { password: 'Student@1234', role: 'STUDENT', firstName: 'Ali', lastName: 'Hassan' },
  'student2@school.edu': { password: 'Student@1234', role: 'STUDENT', firstName: 'Fatima', lastName: 'Malik' },
  'student3@school.edu': { password: 'Student@1234', role: 'STUDENT', firstName: 'Omar', lastName: 'Sheikh' },
}

export async function login(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const email = (formData.get('email') as string || '').trim().toLowerCase()
  const password = (formData.get('password') as string || '').trim()

  // 1. Try direct Supabase sign in
  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

  if (!signInError && authData.user) {
    cookieStore.delete('demo_user')
    revalidatePath('/', 'layout')
    redirect('/')
  }

  // 2. Fallback check for demo accounts
  const demoAccount = DEMO_ACCOUNTS[email]
  if (demoAccount && demoAccount.password === password) {
    // Try auto-creating account in Supabase
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: demoAccount.firstName,
            last_name: demoAccount.lastName,
            role: demoAccount.role,
          },
        },
      })

      if (!signUpError && signUpData.user) {
        const { error: retryError } = await supabase.auth.signInWithPassword({ email, password })
        if (!retryError) {
          await supabase.from('profiles').upsert({
            id: signUpData.user.id,
            role: demoAccount.role,
            first_name: demoAccount.firstName,
            last_name: demoAccount.lastName,
          })
          cookieStore.delete('demo_user')
          revalidatePath('/', 'layout')
          redirect('/')
        }
      }
    } catch {
      // Continue to demo session cookie fallback if Supabase auth fails
    }

    // Set demo user cookie for local preview
    cookieStore.set('demo_user', JSON.stringify({
      email,
      role: demoAccount.role,
      first_name: demoAccount.firstName,
      last_name: demoAccount.lastName,
    }), { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 })

    revalidatePath('/', 'layout')
    if (demoAccount.role === 'SUPER_ADMIN' || demoAccount.role === 'SCHOOL_ADMIN') {
      redirect('/admin')
    } else if (demoAccount.role === 'TEACHER') {
      redirect('/teacher')
    } else {
      redirect('/student')
    }
  }

  redirect('/login?error=Invalid login credentials')
}

export async function logout() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  await supabase.auth.signOut()
  cookieStore.delete('demo_user')
  revalidatePath('/', 'layout')
  redirect('/login')
}

