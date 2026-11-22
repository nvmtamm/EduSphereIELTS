import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { CommandMenu } from './CommandMenu'

export const Layout: React.FC = () => {
  const [commandMenuOpen, setCommandMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-red-100 selection:text-red-900">
      <Header onOpenCommandMenu={() => setCommandMenuOpen(true)} onToggleSidebar={() => setSidebarOpen((o) => !o)} />

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">
          <Sidebar />
        </aside>

        {/* Mobile drawer */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 top-[72px] z-30 flex">
            <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
              <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </aside>
            <div className="flex-1 bg-black/30" onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        <main className="flex-1 min-w-0 px-4 sm:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <CommandMenu open={commandMenuOpen} onOpenChange={setCommandMenuOpen} />
    </div>
  )
}
