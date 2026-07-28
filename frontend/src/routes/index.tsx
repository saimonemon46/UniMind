import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { FacultyLayout } from '@/layouts/FacultyLayout'
import { StudentLayout } from '@/layouts/StudentLayout'
import { AdvisorLayout } from '@/layouts/AdvisorLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DatabaseDashboard } from '@/components/dashboard/DatabaseDashboard'
import { ManageUsers } from '@/features/admin/pages/ManageUsers'
import { ManageCourses } from '@/features/admin/pages/ManageCourses'
import { ManageDepartments } from '@/features/admin/pages/ManageDepartments'
import { InstitutionalAnalytics } from '@/features/admin/pages/InstitutionalAnalytics'
import { ManageSchedules } from '@/features/admin/pages/ManageSchedules'

import { MyCourses as FacultyCourses } from '@/features/faculty/pages/MyCourses'
import { AttendanceMarking } from '@/features/faculty/pages/AttendanceMarking'
import { GradeEntry } from '@/features/faculty/pages/GradeEntry'
import { AssignmentManager } from '@/features/faculty/pages/AssignmentManager'
import { StudentRiskView } from '@/features/faculty/pages/StudentRiskView'
import { MySchedule as FacultySchedule } from '@/features/faculty/pages/MySchedule'

import { MyCourses as StudentCourses } from '@/features/student/pages/MyCourses'
import { MyAttendance } from '@/features/student/pages/MyAttendance'
import { MyGrades } from '@/features/student/pages/MyGrades'
import { Assignments } from '@/features/student/pages/Assignments'
import { AcademicProgress } from '@/features/student/pages/AcademicProgress'
import { MySchedule as StudentSchedule } from '@/features/student/pages/MySchedule'

import { AssignedStudents } from '@/features/advisor/pages/AssignedStudents'
import { InterventionPlans } from '@/features/advisor/pages/InterventionPlans'
import { CounselingLog } from '@/features/advisor/pages/CounselingLog'

export const router = createBrowserRouter([
  { path: '/', element: <RootLayout />, children: [
    { index: true, element: <Navigate to="/login" replace /> },
    { path: 'login', element: <LoginPage /> },
    { path: 'unauthorized', element: <div className="rounded-lg border border-ink-10 bg-white p-6">You do not have access to this area.</div> },
    { path: 'admin', element: <ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>, children: [
      { index: true, element: <DatabaseDashboard /> }, { path: 'users', element: <ManageUsers /> }, { path: 'courses', element: <ManageCourses /> }, { path: 'departments', element: <ManageDepartments /> }, { path: 'schedules', element: <ManageSchedules /> }, { path: 'analytics', element: <InstitutionalAnalytics /> },
    ]},
    { path: 'faculty', element: <ProtectedRoute allowedRoles={['faculty']}><FacultyLayout /></ProtectedRoute>, children: [
      { index: true, element: <DatabaseDashboard /> }, { path: 'courses', element: <FacultyCourses /> }, { path: 'attendance', element: <AttendanceMarking /> }, { path: 'grades', element: <GradeEntry /> }, { path: 'assignments', element: <AssignmentManager /> }, { path: 'schedule', element: <FacultySchedule /> }, { path: 'risk', element: <StudentRiskView /> },
    ]},
    { path: 'student', element: <ProtectedRoute allowedRoles={['student']}><StudentLayout /></ProtectedRoute>, children: [
      { index: true, element: <DatabaseDashboard /> }, { path: 'courses', element: <StudentCourses /> }, { path: 'attendance', element: <MyAttendance /> }, { path: 'grades', element: <MyGrades /> }, { path: 'assignments', element: <Assignments /> }, { path: 'progress', element: <AcademicProgress /> }, { path: 'schedule', element: <StudentSchedule /> },
    ]},
    { path: 'advisor', element: <ProtectedRoute allowedRoles={['advisor']}><AdvisorLayout /></ProtectedRoute>, children: [
      { index: true, element: <DatabaseDashboard /> }, { path: 'students', element: <AssignedStudents /> }, { path: 'plans', element: <InterventionPlans /> }, { path: 'counseling', element: <CounselingLog /> },
    ]},
  ]},
])

