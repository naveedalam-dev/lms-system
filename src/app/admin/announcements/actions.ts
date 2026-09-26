'use server'

import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@/lib/supabase-admin'

export async function deleteAnnouncement(id: string) {
  try {
    const admin = getAdminClient()
    const { error } = await admin.from('announcements').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/admin/announcements')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    console.error('deleteAnnouncement error:', err)
    return { success: false, error: err.message }
  }
}
