import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { ThemeToggle } from './ThemeToggle'
import { ProfileModal } from '@/features/auth/components/ProfileModal'
import { LogOut, User as UserIcon, Target, Bell } from 'lucide-react'

export const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <header className="h-16 sticky top-0 z-20 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-black/95 backdrop-blur-md">
        {/* Left title / target band score */}
        <div className="flex items-center gap-3">
          <h1 className="text-base font-extrabold text-zinc-950 dark:text-white">
            IELTS Preparation Hub
          </h1>
          {user?.targetBandScore && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-900 dark:text-white shadow-xs">
              <Target className="w-3.5 h-3.5 text-red-600" />
              <span>Target: Band {user.targetBandScore.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Notifications */}
          <button className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors relative cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="w-2 h-2 rounded-full bg-red-600 absolute top-2 right-2 ring-2 ring-white dark:ring-black"></span>
          </button>

          {/* User profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-zinc-950 dark:text-white leading-none">
                  {user?.fullName || 'User'}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">
                  {user?.role || 'Student'}
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl py-2 z-50 animate-in fade-in-0 zoom-in-95">
                <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-850">
                  <p className="text-xs font-bold text-zinc-950 dark:text-white truncate">{user?.fullName}</p>
                  <p className="text-[11px] text-zinc-400 truncate">{user?.email}</p>
                </div>

                <div className="p-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false)
                      setProfileModalOpen(true)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-zinc-400" />
                    My Profile
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false)
                      logout()
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Settings Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  )
}
