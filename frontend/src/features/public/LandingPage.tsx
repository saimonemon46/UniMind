import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.store'
import { apiClient } from '@/api/client'
import { LoginModal } from '@/features/auth/components/LoginModal'
import {
  GraduationCap,
  Calendar,
  Bell,
  BookOpen,
  Users,
  Building,
  Award,
  ChevronRight,
  LogIn,
  LayoutDashboard,
  Clock,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import campusHero from '@/assets/campus_hero.jpg'

interface Announcement {
  id: number
  title: string
  body: string
  published_at: string
  created_by_name?: string
}

export function LandingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, token } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'calendar' | 'notices'>('calendar')

  const isLoginOpen = location.pathname === '/login'

  // Fetch announcements if logged in
  const { data: realNotices = [], isLoading: isLoadingNotices } = useQuery<Announcement[]>({
    queryKey: ['public-announcements'],
    queryFn: async () => {
      if (!token) return []
      const res = await apiClient.get<any>('/announcements/')
      return res.data?.data || res.data || []
    },
    enabled: !!token,
  })

  // Mock Notices for non-logged in guests
  const mockNotices: Announcement[] = [
    {
      id: 1,
      title: 'Fall Semester Registration & Course Add/Drop Period Open',
      body: 'The portal is open for Fall course selection. Students are advised to consult their advisors before selecting elective courses.',
      published_at: '2026-08-20T10:00:00Z',
      created_by_name: 'Academic Registry'
    },
    {
      id: 2,
      title: 'UniMind Annual Tech Symposium & Research Convocation',
      body: 'Register for the annual symposium featuring industry leaders, research poster presentations, and project exhibitions.',
      published_at: '2026-08-18T14:30:00Z',
      created_by_name: 'Research Office'
    },
    {
      id: 3,
      title: 'Campus Central Library Extensions & Digital Portal Launch',
      body: 'Our library has extended its physical operating hours until 10:00 PM. Access the new online digital catalog through the student dashboard.',
      published_at: '2026-08-15T09:00:00Z',
      created_by_name: 'Library Admin'
    }
  ]

  const notices = token && realNotices.length > 0 ? realNotices : mockNotices

  // Academic Calendar Events
  const calendarEvents = [
    { date: 'Aug 25, 2026', title: 'Fall Semester Classes Commence', desc: 'First day of instruction for the new academic semester.' },
    { date: 'Sep 10, 2026', title: 'Course Add/Drop Deadline', desc: 'Last day to modify course registrations without penalty.' },
    { date: 'Oct 12 - 16, 2026', title: 'Midterm Examination Week', desc: 'Midterm evaluations scheduled across all departments.' },
    { date: 'Nov 20, 2026', title: 'Course Withdrawal Deadline', desc: 'Final date to drop a course with a "W" grade.' },
    { date: 'Dec 14 - 22, 2026', title: 'Semester Final Examinations', desc: 'End-of-semester final evaluations.' },
    { date: 'Dec 28, 2026', title: 'Final Grade Publishing', desc: 'Official transcript updates and grading updates published.' }
  ]

  // Dashboard routing helper based on role
  const handleDashboardRedirect = () => {
    if (!user) {
      navigate('/login')
      return
    }
    switch (user.role) {
      case 'admin':
        navigate('/admin')
        break
      case 'faculty':
        navigate('/faculty')
        break
      case 'student':
        navigate('/student')
        break
      case 'advisor':
        navigate('/advisor')
        break
      default:
        navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Premium Header/Nav */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-150 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-gray-900 tracking-tight block">UniMind</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold block -mt-1">University Portal</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a href="#about" className="hover:text-indigo-600 transition-colors">About</a>
            <a href="#metrics" className="hover:text-indigo-600 transition-colors">Campus Stats</a>
            <a href="#info-section" className="hover:text-indigo-600 transition-colors">Calendar & Notices</a>
            <a href="#contact" className="hover:text-indigo-600 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={handleDashboardRedirect}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-indigo-100 hover:shadow-indigo-200"
              >
                <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
              </button>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-indigo-100 hover:shadow-indigo-200"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                <BookOpen className="w-3.5 h-3.5" />
                Empowering Minds, Shaping Futures
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-none">
                Welcome to <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">UniMind</span>
                <br />Integrated Portal
              </h1>
              <p className="text-base text-gray-600 leading-relaxed max-w-xl">
                The university portal is your centralized gateway for academic tracking, course enrollments, institutional announcements, direct advising networks, and smart AI tutor support.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={handleDashboardRedirect}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200"
                >
                  {user ? 'Enter Dashboard' : 'Access Portal'} <ChevronRight className="w-4 h-4" />
                </button>
                <a
                  href="#info-section"
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
                >
                  <Calendar className="w-4 h-4 text-gray-500" /> Academic Schedule
                </a>
              </div>
            </div>

            {/* Right Image/Design Column */}
            <div className="lg:col-span-6">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-3xl opacity-10 blur-xl"></div>
                <div className="relative bg-white rounded-3xl border border-gray-150 shadow-2xl overflow-hidden aspect-[16/10]">
                  <img
                    src={campusHero}
                    alt="UniMind Campus"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/95 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg max-w-md">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Modern Architecture</span>
                    <span className="text-sm font-extrabold text-gray-900 mt-1 block">Campus Block A & Advanced Computing Center</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section id="metrics" className="py-12 bg-slate-50 border-y border-gray-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Users className="w-5 h-5 text-indigo-600" />, count: '10,000+', label: 'Active Students' },
              { icon: <Building className="w-5 h-5 text-indigo-600" />, count: '12+', label: 'Academic Departments' },
              { icon: <GraduationCap className="w-5 h-5 text-indigo-600" />, count: '150+', label: 'Expert Faculty' },
              { icon: <Award className="w-5 h-5 text-indigo-600" />, count: '98%', label: 'Placement Success' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-xl font-extrabold text-gray-900 tracking-tight">{stat.count}</div>
                  <div className="text-xs text-gray-500 font-semibold">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section (Notices and Academic Calendar) */}
      <section id="info-section" className="py-16 bg-white flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Academic Notices & Events</h2>
            <p className="text-sm text-gray-500 mt-2">
              Stay up-to-date with current notifications, deadlines, and key terms in the current term.
            </p>

            <div className="inline-flex p-1 bg-slate-100 rounded-xl mt-6">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-5 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
                  activeTab === 'calendar'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" /> Academic Calendar
              </button>
              <button
                onClick={() => setActiveTab('notices')}
                className={`px-5 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
                  activeTab === 'notices'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Bell className="w-3.5 h-3.5" /> Announcements
              </button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {activeTab === 'calendar' ? (
              <div className="bg-slate-50 border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-extrabold text-gray-900 text-base mb-6 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Key Academic Schedule - Fall 2026
                </h3>

                <div className="relative border-l border-indigo-200 ml-3 space-y-8">
                  {calendarEvents.map((evt, idx) => (
                    <div key={idx} className="relative pl-6">
                      <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-50"></div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-bold text-indigo-600 font-mono">{evt.date}</span>
                        <h4 className="font-bold text-sm text-gray-900 sm:order-first">{evt.title}</h4>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{evt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {isLoadingNotices ? (
                  <div className="text-center py-8 text-sm text-gray-500">Loading announcements...</div>
                ) : (
                  notices.map((notice) => (
                    <div key={notice.id} className="bg-slate-50 border border-gray-200 hover:border-gray-300 rounded-2xl p-5 shadow-sm transition-all">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="font-extrabold text-sm text-gray-900">{notice.title}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md whitespace-nowrap flex items-center gap-1 font-mono">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(notice.published_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-2 leading-relaxed">{notice.body}</p>
                      <div className="text-[10px] text-gray-400 font-semibold mt-3">
                        Published by: {notice.created_by_name || 'Admin'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About / Campus Life Section */}
      <section id="about" className="py-16 bg-slate-50 border-t border-gray-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">State of the Art Education</span>
              <h2 className="text-3xl font-extrabold text-gray-900 mt-2 tracking-tight leading-tight">
                Modern Facilities Supporting Interactive Academics
              </h2>
              <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                UniMind is dedicated to providing students and faculty with modern learning environments. Our research centers, smart classrooms, and centralized communication tools make university administration smooth and accessible from anywhere.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <h4 className="font-extrabold text-sm text-gray-900">Virtual Learning</h4>
                  <p className="text-xs text-gray-500 mt-1">Smart class management, grade audits, and timeline schedule updates.</p>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <h4 className="font-extrabold text-sm text-gray-900">AI Recommendations</h4>
                  <p className="text-xs text-gray-500 mt-1">Custom insights, advising tracks, and integrated tutor bots.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="h-44 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center text-white font-bold p-4 shadow-lg text-center text-sm shadow-indigo-100">
                Advanced Computing Laboratories
              </div>
              <div className="h-44 bg-indigo-900 rounded-2xl flex items-center justify-center text-white font-bold p-4 shadow-lg text-center text-sm shadow-slate-200 mt-6">
                Centralized Student Resource Hub
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer id="contact" className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 rounded-xl text-white">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="font-bold text-white text-base">UniMind UMS</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                A unified university management system providing next-gen tools for student audits, advisor intervention, schedule routing, and academic success.
              </p>
            </div>

            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#about" className="hover:text-white transition-colors">About Campus</a></li>
                <li><a href="#info-section" className="hover:text-white transition-colors">Academic Schedule</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Portal Login</Link></li>
                <li><a href="#metrics" className="hover:text-white transition-colors">Statistics</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Support Channels</h4>
              <ul className="space-y-2 text-xs">
                <li><span className="hover:text-white transition-colors cursor-pointer">Registrar Helpdesk</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">IT Service Operations</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Student Counselling Office</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Contact Info</h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-500" /> 100 University Plaza, Tech City</li>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-indigo-500" /> +880-1700-000000</li>
                <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-indigo-500" /> support@unimind.edu</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span>&copy; 2026 UniMind University Portal. All rights reserved.</span>
            <div className="flex gap-4">
              <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-400 cursor-pointer">Privacy Guidelines</span>
            </div>
          </div>
        </div>
      </footer>
      <LoginModal open={isLoginOpen} onClose={() => navigate('/')} />
    </div>
  )
}
