import React, { useState, useEffect } from 'react'
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

interface NavItem {
  name: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: 'IELTS Academic Skills',
    items: [
      { name: 'Reading', path: '/reading', icon: BookOpen },
      { name: 'Listening', path: '/listening', icon: Headphones },
      { name: 'Writing AI', path: '/writing', icon: PenTool },
      { name: 'Speaking AI', path: '/speaking', icon: Mic },
    ]
  },
  {
    title: 'Practice & Assessment',
    items: [
      { name: 'Academic Vocabulary', path: '/vocabulary', icon: Sparkles },
      { name: 'AI Reading Coach', path: '/ai-tutor', icon: Bot },
      { name: 'Full Mock Test', path: '/mock-test', icon: Award }
    ]
  }
]

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('edusphere_sidebar_collapsed') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('edusphere_sidebar_collapsed', String(collapsed))
  }, [collapsed])

  return (
    <aside
      className={`h-screen sticky top-0 transition-all duration-300 ease-in-out z-30 flex flex-col justify-between border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div
          className={`h-16 flex items-center border-b border-slate-200/80 dark:border-slate-800 ${
            collapsed ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          {collapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              className="group relative flex items-center justify-center p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer"
              title="Expand sidebar"
            >
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="absolute -right-1.5 -bottom-1 bg-slate-900 text-white dark:bg-white dark:text-slate-900 p-0.5 rounded-full shadow-md">
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          ) : (
            <>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30 shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white leading-tight">
                    Edu<span className="text-red-600">Sphere</span>
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-900 dark:text-slate-100">
                    IELTS ACADEMIC
                  </span>
                </div>
              </div>

              <button
                onClick={() => setCollapsed(true)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Navigation sections */}
        <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-80px)]">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              {!collapsed && (
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {section.title}
                </p>
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon

                  if (collapsed) {
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        title={item.name}
                        className={({ isActive }) =>
                          `w-11 h-11 mx-auto flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
                            isActive
                              ? 'bg-red-600 text-white shadow-md shadow-red-600/30 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-950 dark:hover:text-white'
                          }`
                        }
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                      </NavLink>
                    )
                  }

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3.5 rounded-xl text-[14px] px-3.5 py-2.5 transition-all duration-200 group cursor-pointer ${
                          isActive
                            ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold border-l-4 border-red-600 pl-2.5 shadow-xs'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-900/80 hover:text-slate-950 dark:hover:text-white font-semibold'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Branding Note */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            Cambridge Standard • Band 7.5+
          </p>
        </div>
      )}
    </aside>
  )
}
