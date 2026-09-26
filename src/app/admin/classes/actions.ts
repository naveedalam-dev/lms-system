'use server'

import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@/lib/supabase-admin'

export async function deleteClassSection(id: string) {
  try {
    const admin = getAdminClient()
    const { error } = await admin.from('sections').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/admin/classes')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    console.error('deleteClassSection error:', err)
    return { success: false, error: err.message }
  }
}
