'use server'

import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@/lib/supabase-admin'

export async function createTeacher(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = (formData.get('password') as string) || 'Teacher@1234'
    const firstName = formData.get('first_name') as string
    const lastName = formData.get('last_name') as string
    const employeeId = formData.get('employee_id') as string
    const qualification = formData.get('qualification') as string
    const specialization = formData.get('specialization') as string
    const dateOfJoining = formData.get('date_of_joining') as string

    if (!email) {
      return { success: false, error: 'Email is required' }
    }

    const admin = getAdminClient()

    // 1. Create auth user
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      },
    })

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || 'Failed to create teacher account' }
    }

    const userId = authData.user.id

    // 2. Update profile
    await admin.from('profiles').upsert({
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      role: 'TEACHER',
      is_active: true,
    })

    // 3. Create teacher profile
    const { error: tpError } = await admin.from('teacher_profiles').upsert({
      user_id: userId,
      employee_id: employeeId || null,
      qualification: qualification || null,
      specialization: specialization || null,
      date_of_joining: dateOfJoining || new Date().toISOString().split('T')[0],
    })

    if (tpError) {
      console.error('Error inserting teacher profile:', tpError)
    }

    revalidatePath('/admin/teachers')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    console.error('createTeacher error:', err)
    return { success: false, error: err.message || 'Internal server error' }
  }
}

export async function deleteTeacher(userId: string) {
  try {
    const admin = getAdminClient()
    const { error } = await admin.auth.admin.deleteUser(userId)
    if (error) {
      await admin.from('profiles').delete().eq('id', userId)
    }
    revalidatePath('/admin/teachers')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    console.error('deleteTeacher error:', err)
    return { success: false, error: err.message }
  }
}

export async function toggleTeacherStatus(userId: string, currentStatus: boolean) {
  try {
    const admin = getAdminClient()
    const { error } = await admin
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('id', userId)

    if (error) throw error
    revalidatePath('/admin/teachers')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
