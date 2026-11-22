import React from 'react'
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
  Route
} from 'lucide-react'

interface NavItem {
  name: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}

const groups: NavItem[][] = [
  [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Learning Path', path: '/learning-path', icon: Route }
  ],
  [
    { name: 'Reading', path: '/reading', icon: BookOpen },
    { name: 'Listening', path: '/listening', icon: Headphones },
    { name: 'Writing', path: '/writing', icon: PenTool },
    { name: 'Speaking', path: '/speaking', icon: Mic }
  ],
  [
    { name: 'Vocabulary', path: '/vocabulary', icon: Sparkles },
    { name: 'AI Tutor', path: '/ai-tutor', icon: Bot },
    { name: 'Mock Test', path: '/mock-test', icon: Award }
  ]
]

interface SidebarProps {
  onNavigate?: () => void
}

/** Flat left navigation: white, light-red active pill, thin group dividers. */
export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => (
  <nav className="p-3">
    {groups.map((items, gi) => (
      <div key={gi} className={`space-y-1 ${gi > 0 ? 'mt-3 pt-3 border-t border-slate-200 dark:border-slate-800' : ''}`}>
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-red-50 dark:bg-red-950/40 text-red-600'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          )
        })}
      </div>
    ))}
  </nav>
)
