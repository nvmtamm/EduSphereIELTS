import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ThemeToggle } from './ThemeToggle'
import { ProfileModal } from '@/features/auth/components/ProfileModal'
import { LogOut, User as UserIcon, Search, Command as CommandIcon, Menu, GraduationCap } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'

interface HeaderProps {
  onOpenCommandMenu?: () => void
  onToggleSidebar?: () => void
}

/** Top navigation bar: flat, white, content-first (study-app style). */
export const Header: React.FC<HeaderProps> = ({ onOpenCommandMenu, onToggleSidebar }) => {
  const { user, logout } = useAuth()
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="h-[72px] px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onToggleSidebar} className="lg:hidden p-2 -ml-2 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer" aria-label="Menu">
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </span>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                Edu<span className="text-red-600">Sphere</span>
              </span>
              <span className="hidden sm:inline pl-3 ml-1 border-l border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-500 leading-tight">Self-study<br />IELTS</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenCommandMenu}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
              title="Search (⌘K)"
            >
              <Search className="w-5 h-5" />
            </button>
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm cursor-pointer">
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.fullName}</p>
                  <p className="text-xs text-slate-500 font-normal truncate">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setProfileModalOpen(true)}>
                  <UserIcon className="mr-2 h-4 w-4 text-slate-400" />
                  Profile & target score
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onOpenCommandMenu}>
                  <CommandIcon className="mr-2 h-4 w-4 text-slate-400" />
                  Search (⌘K)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>

      </header>

      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </>
  )
}
