import axios from 'axios'

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://127.0.0.1:8001'

const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function askAITutor(message: string, courseCode?: string, history: ChatMessage[] = []) {
  const response = await aiClient.post('/ai/v1/tutoring/chat', {
    message,
    course_code: courseCode,
    conversation_history: history,
  })
  return response.data
}

export async function fetchRiskAssessment(studentId: string, studentName: string, attendanceRate: number, gpa: number, failedAssignments: number = 0) {
  const response = await aiClient.post('/ai/v1/advising/risk-assessment', {
    student_id: studentId,
    student_name: studentName,
    attendance_rate: attendanceRate,
    gpa,
    failed_assignments: failedAssignments,
  })
  return response.data
}

export async function fetchInstitutionalAnalyticsSummary(totalStudents: number, totalFaculty: number, activeCourses: number, averageAttendance: number) {
  const response = await aiClient.post('/ai/v1/analytics/summary', {
    total_students: totalStudents,
    total_faculty: totalFaculty,
    active_courses: activeCourses,
    average_attendance: averageAttendance,
  })
  return response.data
}
