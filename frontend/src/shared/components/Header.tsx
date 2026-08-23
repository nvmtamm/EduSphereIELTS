import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { ThemeToggle } from './ThemeToggle'
import { LogOut, User as UserIcon, Target, Bell } from 'lucide-react'

export const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
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
    <header className="h-16 sticky top-0 z-20 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      {/* Left title / search context */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          IELTS Preparation Hub
        </h1>
        {user?.targetBandScore && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <Target className="w-3.5 h-3.5 text-blue-500" />
            <span>Target: Band {user.targetBandScore.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {/* Notifications placeholder */}
        <button className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="w-2 h-2 rounded-full bg-blue-500 absolute top-2 right-2 ring-2 ring-white dark:ring-slate-950"></span>
        </button>

        {/* User profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">
                {user?.fullName || 'User'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {user?.role || 'Student'}
              </span>
            </div>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in-0 zoom-in-95">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.fullName}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <div className="p-1">
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  My Profile
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    logout()
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors text-left"
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
  )
}
