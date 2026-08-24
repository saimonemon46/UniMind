import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Calendar, Plus, MessageSquare } from 'lucide-react'

interface CounselingLogItem {
  id: number
  advisor_name: string
  student_name: string
  met_at: string
  notes: string
  follow_up_at?: string
}

export function CounselingLog() {
  const { data: logs = [], isLoading } = useQuery<CounselingLogItem[]>({
    queryKey: ['counselingLogs'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/advisors/logs/')
      const data = res.data
      if (Array.isArray(data)) return data
      if (Array.isArray(data?.data)) return data.data
      return []
    },
  })

  return (
    <>
      <PageHeader label="Advising History" title="Student Counseling Logs" />

      <div className="mt-5 flex justify-between items-center">
        <h3 className="text-base font-bold text-gray-900">Recorded Sessions ({logs.length})</h3>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Record New Counseling Session
        </button>
      </div>

      <div className="mt-4 grid gap-4">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-gray-500">Loading counseling records...</div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">No counseling session logs found.</div>
        ) : (
          logs.map((log) => (
            <Card key={log.id} className="p-5 border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-bold text-gray-900">{log.student_name}</span>
                </div>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Met on: {new Date(log.met_at).toLocaleDateString()}
                </span>
              </div>

              <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
                {log.notes}
              </p>

              {log.follow_up_at && (
                <div className="mt-2 text-xs text-indigo-700 font-semibold flex items-center gap-1">
                  📅 Follow-up scheduled for: {new Date(log.follow_up_at).toLocaleDateString()}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </>
  )
}
