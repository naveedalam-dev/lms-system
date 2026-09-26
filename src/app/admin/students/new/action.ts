'use server'

import { createStudent } from '../actions'

export async function addStudent(formData: FormData) {
  return createStudent(formData)
}
