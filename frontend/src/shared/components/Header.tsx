import React, { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ThemeToggle } from './ThemeToggle'
import { ProfileModal } from '@/features/auth/components/ProfileModal'
import { 
  LogOut, 
  User as UserIcon, 
  Target, 
  Bell, 
  Search, 
  ChevronRight,
  Sparkles,
  Command as CommandIcon,
  ShieldCheck
} from 'lucide-react'
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
}

export const Header: React.FC<HeaderProps> = ({ onOpenCommandMenu }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  // Generate dynamic breadcrumb segments
  const pathSegments = location.pathname.split('/').filter(Boolean)
  const breadcrumbs = pathSegments.map((segment, index) => {
    const url = `/${pathSegments.slice(0, index + 1).join('/')}`
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ')
    return { label, url, isLast: index === pathSegments.length - 1 }
  })

  return (
    <>
      <header className="h-16 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/90 dark:bg-black/90 backdrop-blur-md">
        {/* Left: Dynamic Breadcrumb & Path */}
        <div className="flex items-center gap-2 text-xs">
          <Link
            to="/dashboard"
            className="font-bold text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors"
          >
            EduSphere
          </Link>

          {breadcrumbs.length > 0 ? (
            breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                {crumb.isLast ? (
                  <span className="font-extrabold text-zinc-950 dark:text-white truncate max-w-[160px] sm:max-w-[240px]">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.url}
                    className="font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))
          ) : (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-extrabold text-zinc-950 dark:text-white">
                Dashboard
              </span>
            </>
          )}
        </div>

        {/* Center: Command Palette Trigger Button (⌘K) */}
        <div className="flex-1 max-w-sm mx-4 hidden md:block">
          <button
            type="button"
            onClick={onOpenCommandMenu}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-xs text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <span>Search modules, roadmaps, exams...</span>
            </div>
            <kbd className="inline-flex items-center gap-1 rounded bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700">
              <span>⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Button */}
          <button
            onClick={onOpenCommandMenu}
            className="md:hidden p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            title="Search (⌘K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* User Profile Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 p-1 sm:pr-3 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-zinc-950 dark:text-white leading-none">
                    {user?.fullName || 'User'}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    Target: Band {user?.targetBandScore ? user.targetBandScore.toFixed(1) : '7.5+'}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="text-xs font-bold text-zinc-950 dark:text-white truncate">{user?.fullName}</p>
                <p className="text-[10px] text-zinc-400 font-normal truncate">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => setProfileModalOpen(true)}>
                <UserIcon className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                Profile & Target Score
              </DropdownMenuItem>

              <DropdownMenuItem onClick={onOpenCommandMenu}>
                <CommandIcon className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                Command Palette (⌘K)
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={logout}
                className="text-red-600 dark:text-red-400 font-bold focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40"
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
