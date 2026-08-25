import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { CommandMenu } from './CommandMenu'

export const Layout: React.FC = () => {
  const [commandMenuOpen, setCommandMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 selection:bg-red-500 selection:text-white">
      {/* Collapsible Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenCommandMenu={() => setCommandMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette (⌘K) */}
      <CommandMenu
        open={commandMenuOpen}
        onOpenChange={setCommandMenuOpen}
      />
    </div>
  )
}
