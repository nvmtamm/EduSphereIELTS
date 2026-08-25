import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
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
  GraduationCap,
  Target,
  Compass,
  UploadCloud,
  Database
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'

interface NavItem {
  name: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  badgeColor?: string
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
      { name: 'Reading Hub', path: '/reading', icon: BookOpen, badge: '6 Bands', badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30' },
      { name: 'Listening', path: '/listening', icon: Headphones },
      { name: 'Writing AI', path: '/writing', icon: PenTool },
      { name: 'Speaking AI', path: '/speaking', icon: Mic },
    ]
  },
  {
    title: 'AI Agents & Vaults',
    items: [
      { name: 'Vocabulary (SM-2)', path: '/vocabulary', icon: Sparkles, badge: 'A1–C2', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
      { name: 'AI Socratic Tutor', path: '/ai-tutor', icon: Bot, badge: 'RAG', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
      { name: 'Mock Test Simulator', path: '/mock-test', icon: Award }
    ]
  }
]

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('edusphere_sidebar_collapsed') === 'true'
  })
  const { user } = useAuth()

  useEffect(() => {
    localStorage.setItem('edusphere_sidebar_collapsed', String(collapsed))
  }, [collapsed])

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={`h-screen sticky top-0 transition-all duration-300 ease-in-out z-30 flex flex-col justify-between border-r border-zinc-200 dark:border-zinc-800/80 bg-white/95 dark:bg-black/95 backdrop-blur-xl shrink-0 ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div
            className={`h-16 flex items-center border-b border-zinc-200 dark:border-zinc-800/80 ${
              collapsed ? 'justify-center px-2' : 'justify-between px-4'
            }`}
          >
            {collapsed ? (
              <button
                onClick={() => setCollapsed(false)}
                className="group relative flex items-center justify-center p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                title="Expand sidebar"
              >
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="absolute -right-2 -bottom-1 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 p-0.5 rounded-full shadow-md">
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
                    <span className="font-black text-lg tracking-tight text-zinc-950 dark:text-white leading-tight">
                      Edu<span className="text-red-600">Sphere</span>
                    </span>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-red-600">
                      IELTS MULTI-AGENT
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setCollapsed(true)}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  title="Collapse sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Navigation sections */}
          <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {!collapsed && (
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {section.title}
                  </p>
                )}

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon

                    if (collapsed) {
                      return (
                        <Tooltip key={item.path}>
                          <TooltipTrigger asChild>
                            <NavLink
                              to={item.path}
                              className={({ isActive }) =>
                                `flex items-center justify-center p-2.5 rounded-xl transition-all duration-200 ${
                                  isActive
                                    ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'
                                }`
                              }
                            >
                              <Icon className="w-5 h-5 shrink-0" />
                            </NavLink>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="flex items-center gap-2">
                            <span>{item.name}</span>
                            {item.badge && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-red-500 text-white">
                                {item.badge}
                              </span>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      )
                    }

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center justify-between rounded-xl text-xs font-semibold px-3 py-2 transition-all duration-200 group ${
                            isActive
                              ? 'bg-red-600 text-white shadow-md shadow-red-600/25 font-bold'
                              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'
                          }`
                        }
                      >
                        <div className="flex items-center gap-3 truncate">
                          <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                          <span className="truncate">{item.name}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold border ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Target Band score bottom quick widget */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/80">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-center cursor-pointer hover:border-red-500">
                  <Target className="w-4 h-4 text-red-600 mb-0.5" />
                  <span className="text-[10px] font-black text-red-600">
                    {user?.targetBandScore ? user.targetBandScore.toFixed(1) : '7.5'}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                Target IELTS Band {user?.targetBandScore ? user.targetBandScore.toFixed(1) : '7.5+'}
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between text-xs text-zinc-900 dark:text-white font-bold mb-1">
                <span>Target IELTS</span>
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[11px] shadow-xs">
                  Band {user?.targetBandScore ? user.targetBandScore.toFixed(1) : '7.5+'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Harness Core & SM-2 Ready
              </p>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
