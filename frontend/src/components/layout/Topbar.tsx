import { useState, useRef, useEffect } from 'react'
import { Bell, LogOut, Megaphone, Clock, User, Mail, Shield, Building } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchAnnouncements } from '@/api/messaging.api'
import { Avatar } from '@/components/ui/Avatar'
import { ROLE_LABELS, ROLE_ACCENTS } from '@/constants/roles'
import { useAuth } from '@/hooks/useAuth'

export function Topbar() {
  const navigate = useNavigate()
  const { user, clearSession } = useAuth()
  const [showNotices, setShowNotices] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  
  const noticesRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const { data: notices = [], refetch } = useQuery({
    queryKey: ['announcements'],
    queryFn: fetchAnnouncements,
    enabled: !!user,
  })

  // Poll for notices every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      refetch()
    }, 30000)
    return () => clearInterval(timer)
  }, [refetch])

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (noticesRef.current && !noticesRef.current.contains(target)) {
        setShowNotices(false)
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  return (
    <header className="flex h-16 items-center justify-between border-b border-ink-10 bg-sand-50 px-5 relative z-40">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-ink-30">{ROLE_LABELS[user.role]}</p>
        <h1 className="font-serif text-2xl font-normal tracking-tight text-ink">Welcome back</h1>
      </div>
      <div className="flex items-center gap-3">
        {/* Bell Icon with Notices Dropdown */}
        <div className="relative" ref={noticesRef}>
          <button
            onClick={() => {
              setShowNotices(!showNotices)
              setShowProfile(false)
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-ink-10 bg-white text-ink-60 hover:bg-sand-100 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {notices.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm animate-pulse">
                {notices.length}
              </span>
            )}
          </button>

          {/* Notices Dropdown Overlay */}
          {showNotices && (
            <div className="absolute right-0 mt-2 w-80 max-h-[400px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg py-2 z-50 divide-y divide-gray-150">
              <div className="px-4 py-2 bg-gradient-to-r from-indigo-900 to-indigo-950 text-white flex items-center justify-between rounded-t-xl">
                <span className="font-bold text-xs flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5" /> University Notices
                </span>
                <span className="text-[10px] font-medium bg-indigo-800 px-2 py-0.5 rounded-full">
                  {notices.length} Active
                </span>
              </div>

              {notices.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500">No active notices at this time.</div>
              ) : (
                notices.map((notice) => (
                  <div key={notice.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <h4 className="font-bold text-sm text-gray-900">{notice.title}</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notice.body}</p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-2">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(notice.published_at).toLocaleDateString()}</span>
                      <span>·</span>
                      <span className="font-semibold">{notice.created_by_name || 'Admin'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User Profile Avatar with dropdown details */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfile(!showProfile)
              setShowNotices(false)
            }}
            className="flex items-center focus:outline-none rounded-full ring-2 ring-transparent hover:ring-indigo-300 transition-all"
            aria-label="User profile details"
          >
            <Avatar name={user.fullName} role={user.role} />
          </button>

          {/* Profile Dropdown Overlay */}
          {showProfile && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-gray-200 bg-white shadow-lg p-4 z-50 space-y-4">
              {/* Header profile block */}
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold bg-indigo-100 text-indigo-700">
                  {user.fullName
                    .split(' ')
                    .map((p) => p[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{user.fullName}</h4>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 mt-1">
                    {ROLE_LABELS[user.role]}
                  </span>
                </div>
              </div>

              {/* Profile Details List */}
              <div className="space-y-2.5 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span>Username: <strong className="text-gray-900">{user.username}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">Email: <strong className="text-gray-900">{user.email}</strong></span>
                </div>

                {user.department && (
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-gray-400" />
                    <span>Dept: <strong className="text-gray-900">{user.department}</strong></span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-gray-400" />
                  <span>User ID: <strong className="text-gray-900">#{user.id}</strong></span>
                </div>
              </div>

              {/* Sign out shortcut */}
              <button
                onClick={() => {
                  clearSession()
                  navigate('/')
                }}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-rose-200/50"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Topbar Signout button */}
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-ink-10 bg-white text-ink-60 hover:bg-sand-100 transition-colors"
          aria-label="Sign out"
          onClick={() => {
            clearSession()
            navigate('/')
          }}
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
