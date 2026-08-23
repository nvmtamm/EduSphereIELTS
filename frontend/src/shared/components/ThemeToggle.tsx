import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-slate-900/80 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 transition-all duration-200 shadow-sm cursor-pointer"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700" />
      )}
    </button>
  )
}
