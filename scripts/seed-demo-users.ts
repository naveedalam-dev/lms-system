/**
 * Demo User Seeder
 * Run: npx tsx scripts/seed-demo-users.ts
 * 
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 * Get it from: Supabase Dashboard → Project Settings → API → service_role key
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local')
  console.error('   Get it from: Supabase Dashboard → Project Settings → API → service_role key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const demoUsers = [
  {
    email: 'admin@lms.com',
    password: 'admin123',
    first_name: 'System',
    last_name: 'Admin',
    role: 'SUPER_ADMIN',
  },
  {
    email: 'admin@school.edu',
    password: 'Admin@1234',
    first_name: 'Super',
    last_name: 'Admin',
    role: 'SUPER_ADMIN',
  },
  {
    email: 'teacher1@school.edu',
    password: 'Teacher@1234',
    first_name: 'Sarah',
    last_name: 'Johnson',
    role: 'TEACHER',
    extra: { employee_id: 'EMP-001', qualification: 'M.Ed', specialization: 'Mathematics' },
  },
  {
    email: 'teacher2@school.edu',
    password: 'Teacher@1234',
    first_name: 'Ahmed',
    last_name: 'Khan',
    role: 'TEACHER',
    extra: { employee_id: 'EMP-002', qualification: 'B.Ed', specialization: 'Science' },
  },
  {
    email: 'student1@school.edu',
    password: 'Student@1234',
    first_name: 'Ali',
    last_name: 'Hassan',
    role: 'STUDENT',
    extra: { roll_number: 'G8-001' },
  },
  {
    email: 'student2@school.edu',
    password: 'Student@1234',
    first_name: 'Fatima',
    last_name: 'Malik',
    role: 'STUDENT',
    extra: { roll_number: 'G8-002' },
  },
  {
    email: 'student3@school.edu',
    password: 'Student@1234',
    first_name: 'Omar',
    last_name: 'Sheikh',
    role: 'STUDENT',
    extra: { roll_number: 'G5-001' },
  },
]

async function seedUsers() {
  console.log('🌱 Seeding demo users...\n')

  for (const user of demoUsers) {
    process.stdout.write(`  Creating ${user.email}... `)

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { first_name: user.first_name, last_name: user.last_name },
    })

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log('⚠  Already exists, skipping.')
        continue
      }
      console.log(`❌ Auth error: ${authError.message}`)
      continue
    }

    const userId = authData.user!.id

    // 2. Update profile with role and name
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: user.role, first_name: user.first_name, last_name: user.last_name })
      .eq('id', userId)

    if (profileError) {
      console.log(`❌ Profile error: ${profileError.message}`)
      continue
    }

    // 3. Insert extended profile
    if (user.role === 'TEACHER' && user.extra) {
      await supabase.from('teacher_profiles').insert({
        user_id: userId,
        ...user.extra,
        date_of_joining: new Date().toISOString().split('T')[0],
      })
    }

    if (user.role === 'STUDENT' && user.extra) {
      await supabase.from('student_profiles').insert({
        user_id: userId,
        ...user.extra,
      })
    }

    console.log('✅ Done')
  }

  console.log('\n✨ Seeding complete!\n')
  console.log('Demo Credentials:')
  console.log('─────────────────────────────────────────')
  console.log('👑 Admin    → admin@lms.com        | admin123')
  console.log('👑 Admin    → admin@school.edu     | Admin@1234')
  console.log('👩‍🏫 Teacher1 → teacher1@school.edu  | Teacher@1234')
  console.log('👨‍🏫 Teacher2 → teacher2@school.edu  | Teacher@1234')
  console.log('👦 Student1 → student1@school.edu  | Student@1234')
  console.log('👧 Student2 → student2@school.edu  | Student@1234')
  console.log('👦 Student3 → student3@school.edu  | Student@1234')
  console.log('─────────────────────────────────────────\n')
}

seedUsers().catch(console.error)
