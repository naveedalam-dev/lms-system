'use server'

import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@/lib/supabase-admin'

export interface SubjectInput {
  name: string
  code: string
  description?: string
  color?: string
}

// Supabase throws plain PostgrestError objects (not Error instances), so read
// `.message` off unknown shapes instead of relying on `instanceof Error`.
function toMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message: unknown }).message)
  }
  return fallback
}

export async function createSubject(input: SubjectInput) {
  try {
    const admin = getAdminClient()
    const { data, error } = await admin
      .from('subjects')
      .insert({
        name: input.name,
        code: input.code.toUpperCase(),
        description: input.description || null,
        color: input.color || '#3B82F6',
      })
      .select()
      .single()
    if (error) throw error
    revalidatePath('/admin/subjects')
    return { success: true, subject: data }
  } catch (err) {
    console.error('createSubject error:', err)
    return { success: false, error: toMessage(err, 'Failed to add subject.') }
  }
}

export async function deleteSubject(id: string) {
  try {
    const admin = getAdminClient()
    const { error } = await admin.from('subjects').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/admin/subjects')
    return { success: true }
  } catch (err) {
    console.error('deleteSubject error:', err)
    return { success: false, error: toMessage(err, 'Failed to delete subject.') }
  }
}
