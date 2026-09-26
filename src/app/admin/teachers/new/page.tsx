import { PageHeader } from '@/components/ui/shared'
import { TeacherForm } from './TeacherForm'

export default function NewTeacherPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Add New Teacher"
        subtitle="Register a faculty member and configure their profile in the LMS."
      />

      <TeacherForm />
    </div>
  )
}
