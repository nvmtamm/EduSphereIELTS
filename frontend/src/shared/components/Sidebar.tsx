import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Sparkles,
  Award,
  Bot,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from 'lucide-react'

const navigationItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Reading', path: '/reading', icon: BookOpen },
  { name: 'Listening', path: '/listening', icon: Headphones },
  { name: 'Writing AI', path: '/writing', icon: PenTool },
  { name: 'Speaking AI', path: '/speaking', icon: Mic },
  { name: 'Vocabulary (SM-2)', path: '/vocabulary', icon: Sparkles },
  { name: 'Mock Test', path: '/mock-test', icon: Award },
  { name: 'AI Tutor', path: '/ai-tutor', icon: Bot },
]

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`h-screen sticky top-0 transition-all duration-300 ease-in-out z-30 flex flex-col justify-between border-r border-zinc-200 dark:border-zinc-800/80 bg-white/95 dark:bg-black/95 backdrop-blur-xl ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-zinc-950 dark:text-white">
                  Edu<span className="text-red-600">Sphere</span>
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-red-600">
                  IELTS OFFICIAL PREP
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/25 font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Target score quick pill */}
      {!collapsed && (
        <div className="p-4 m-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-900 dark:text-white font-bold mb-1">
            <span>Target IELTS</span>
            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[11px] shadow-xs">Band 7.5+</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">RAG AI Grader & SM-2 Ready</p>
        </div>
      )}
    </aside>
  )
}
