import { PageHeader } from '@/components/layout/PageHeader'
import { ScheduleTable } from '@/components/academic/ScheduleTable'

export function MySchedule() {
  return <><PageHeader label="Academic operations" title="My timetable" /><p className="mb-5 mt-2 text-sm text-ink-60">Your enrolled classes and published examinations.</p><ScheduleTable /></>
}
