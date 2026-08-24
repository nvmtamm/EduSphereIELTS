import React from 'react'
import { LoginForm } from '../components/LoginForm'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { GraduationCap, Sparkles } from 'lucide-react'

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-zinc-950 relative overflow-hidden transition-colors selection:bg-red-500 selection:text-white">
      {/* Top right theme toggle */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      {/* Decorative ambient gradients */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/10 dark:bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-600/10 dark:bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 my-auto">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 text-white shadow-xl shadow-red-600/30 mb-1">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
              Edu<span className="text-red-600">Sphere</span>
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 mt-1.5 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-900/40 text-[11px] font-bold text-red-600 dark:text-red-400">
              <Sparkles className="w-3 h-3 text-red-500" />
              <span>Target Band 7.5+ AI Platform</span>
            </div>
          </div>
        </div>

        {/* Centered Main Form Card */}
        <div className="p-7 sm:p-8 rounded-3xl bg-white/95 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl shadow-zinc-200/60 dark:shadow-black/60">
          <div className="mb-6 space-y-1 text-center">
            <h2 className="text-xl font-black tracking-tight text-zinc-950 dark:text-white">
              Welcome Back
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Sign in to continue your IELTS preparation and track your progress.
            </p>
          </div>

          <LoginForm />
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] font-medium text-zinc-400 dark:text-zinc-600">
          IELTS Official Prep Platform • Academic & General Training
        </p>
      </div>
    </div>
  )
}
