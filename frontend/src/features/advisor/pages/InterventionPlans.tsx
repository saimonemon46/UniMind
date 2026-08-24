import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { ShieldAlert, Plus, CheckCircle2 } from 'lucide-react'

interface InterventionPlan {
  id: number
  advisor_name: string
  student_name: string
  focus: string
  next_step: string
  status: string
  created_at: string
}

export function InterventionPlans() {
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['interventionPlans'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/advisors/interventions/')
      const data = res.data
      if (Array.isArray(data)) return data
      if (Array.isArray(data?.data)) return data.data
      return []
    },
  })

  return (
    <>
      <PageHeader label="Student Success" title="Academic Intervention Plans" />

      <div className="mt-5 flex justify-between items-center">
        <h3 className="text-base font-bold text-gray-900">Active Interventions ({plans.length})</h3>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Create Intervention Plan
        </button>
      </div>

      <div className="mt-4 grid gap-4">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-gray-500">Loading intervention plans...</div>
        ) : plans.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">No active intervention plans found.</div>
        ) : (
          plans.map((plan) => (
            <Card key={plan.id} className="p-5 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-500 uppercase">Student:</span>
                    <span className="text-sm font-bold text-gray-900">{plan.student_name}</span>
                  </div>
                  <h4 className="text-base font-bold text-indigo-900">{plan.focus}</h4>
                  <p className="text-xs text-gray-600 mt-1">Next Action Step: {plan.next_step}</p>
                </div>

                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                      plan.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800'
                        : plan.status === 'monitoring'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {plan.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  )
}
