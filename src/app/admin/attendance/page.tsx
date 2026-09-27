import { CalendarCheck } from 'lucide-react'
import { PlaceholderPage } from '@/components/ui/placeholder'

export default function AttendancePage() {
  return (
    <PlaceholderPage
      title="Attendance"
      subtitle="Monitor attendance records across all sections."
      icon={CalendarCheck}
    />
  )
}
