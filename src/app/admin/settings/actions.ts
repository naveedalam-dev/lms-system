'use server'

import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@/lib/supabase-admin'

export async function createAcademicYear(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const startDate = formData.get('start_date') as string
    const endDate = formData.get('end_date') as string
    const isActive = formData.get('is_active') === 'on'

    if (!name || !startDate || !endDate) {
      return { success: false, error: 'All fields are required' }
    }

    const admin = getAdminClient()

    if (isActive) {
      // Deactivate all other years first
      await admin.from('academic_years').update({ is_active: false }).neq('name', '')
    }

    const { error } = await admin.from('academic_years').insert({
      name,
      start_date: startDate,
      end_date: endDate,
      is_active: isActive,
    })

    if (error) throw error

    revalidatePath('/admin/settings')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    console.error('createAcademicYear error:', err)
    return { success: false, error: err.message }
  }
}

export async function setActiveAcademicYear(id: string) {
  try {
    const admin = getAdminClient()
    // 1. Deactivate all
    await admin.from('academic_years').update({ is_active: false }).neq('id', id)
    // 2. Activate target
    const { error } = await admin.from('academic_years').update({ is_active: true }).eq('id', id)
    if (error) throw error

    revalidatePath('/admin/settings')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    console.error('setActiveAcademicYear error:', err)
    return { success: false, error: err.message }
  }
}

export async function deleteAcademicYear(id: string) {
  try {
    const admin = getAdminClient()
    const { error } = await admin.from('academic_years').delete().eq('id', id)
    if (error) throw error

    revalidatePath('/admin/settings')
    return { success: true }
  } catch (err: any) {
    console.error('deleteAcademicYear error:', err)
    return { success: false, error: err.message }
  }
}
