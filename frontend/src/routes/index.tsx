import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { FacultyLayout } from '@/layouts/FacultyLayout'
import { StudentLayout } from '@/layouts/StudentLayout'
import { AdvisorLayout } from '@/layouts/AdvisorLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { AdminDashboard } from '@/features/admin/pages/AdminDashboard'
import { FacultyDashboard } from '@/features/faculty/pages/FacultyDashboard'
import { StudentDashboard } from '@/features/student/pages/StudentDashboard'
import { AdvisorDashboard } from '@/features/advisor/pages/AdvisorDashboard'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'unauthorized', element: <div className="rounded-lg border border-ink-10 bg-white p-6">You do not have access to this area.</div> },
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>,
        children: [{ index: true, element: <AdminDashboard /> }],
      },
      {
        path: 'faculty',
        element: <ProtectedRoute allowedRoles={['faculty']}><FacultyLayout /></ProtectedRoute>,
        children: [{ index: true, element: <FacultyDashboard /> }],
      },
      {
        path: 'student',
        element: <ProtectedRoute allowedRoles={['student']}><StudentLayout /></ProtectedRoute>,
        children: [{ index: true, element: <StudentDashboard /> }],
      },
      {
        path: 'advisor',
        element: <ProtectedRoute allowedRoles={['advisor']}><AdvisorLayout /></ProtectedRoute>,
        children: [{ index: true, element: <AdvisorDashboard /> }],
      },
    ],
  },
])
