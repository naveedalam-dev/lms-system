'use server'

import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@/lib/supabase-admin'

export async function createStudent(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = (formData.get('password') as string) || 'Student@1234'
    const firstName = formData.get('first_name') as string
    const lastName = formData.get('last_name') as string
    const rollNumber = formData.get('roll_number') as string
    const gradeId = (formData.get('grade_id') as string) || null
    const sectionId = (formData.get('section_id') as string) || null
    const gender = (formData.get('gender') as string) || null
    const dateOfBirth = (formData.get('date_of_birth') as string) || null
    const guardianName = (formData.get('guardian_name') as string) || null
    const guardianPhone = (formData.get('guardian_phone') as string) || null

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
      return { success: false, error: authError?.message || 'Failed to create student account' }
    }

    const userId = authData.user.id

    // 2. Update profile
    await admin.from('profiles').upsert({
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      role: 'STUDENT',
      is_active: true,
    })

    // 3. Get active academic year
    const { data: activeYear } = await admin
      .from('academic_years')
      .select('id')
      .eq('is_active', true)
      .single()

    // 4. Create student profile
    const { error: spError } = await admin.from('student_profiles').upsert({
      user_id: userId,
      roll_number: rollNumber || null,
      grade_id: gradeId || null,
      section_id: sectionId || null,
      gender: gender || null,
      date_of_birth: dateOfBirth || null,
      guardian_name: guardianName || null,
      guardian_phone: guardianPhone || null,
      academic_year_id: activeYear?.id || null,
    })

    if (spError) {
      console.error('Error inserting student profile:', spError)
    }

    revalidatePath('/admin/students')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    console.error('createStudent error:', err)
    return { success: false, error: err.message || 'Internal server error' }
  }
}

export async function deleteStudent(userId: string) {
  try {
    const admin = getAdminClient()
    const { error } = await admin.auth.admin.deleteUser(userId)
    if (error) {
      // Fallback: delete from profiles if auth fails
      await admin.from('profiles').delete().eq('id', userId)
    }
    revalidatePath('/admin/students')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    console.error('deleteStudent error:', err)
    return { success: false, error: err.message }
  }
}

export async function toggleStudentStatus(userId: string, currentStatus: boolean) {
  try {
    const admin = getAdminClient()
    const { error } = await admin
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('id', userId)

    if (error) throw error
    revalidatePath('/admin/students')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
