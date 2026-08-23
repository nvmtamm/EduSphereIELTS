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
      className={`h-screen sticky top-0 transition-all duration-300 ease-in-out z-30 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
                  EduSphere
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500">
                  IELTS AI Prep
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
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
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
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
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 dark:border-blue-500/10">
          <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 font-semibold mb-1">
            <span>Target IELTS</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[11px]">Band 7.5+</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">RAG AI Grader & SM-2 Ready</p>
        </div>
      )}
    </aside>
  )
}
