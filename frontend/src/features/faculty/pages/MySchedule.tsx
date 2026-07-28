import { PageHeader } from '@/components/layout/PageHeader'
import { ScheduleTable } from '@/components/academic/ScheduleTable'

export function MySchedule() {
  return <><PageHeader label="Academic operations" title="Teaching schedule" /><p className="mb-5 mt-2 text-sm text-ink-60">Your assigned classes and examination duties.</p><ScheduleTable /></>
}
