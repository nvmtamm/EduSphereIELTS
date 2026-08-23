import React from 'react'
import { RegisterForm } from '../components/RegisterForm'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { GraduationCap, Sparkles, Target, Zap, ShieldCheck } from 'lucide-react'

export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Top right theme toggle */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      {/* Left branding & features column */}
      <div className="hidden md:flex md:w-1/2 p-12 bg-gradient-to-br from-indigo-700 via-blue-700 to-slate-900 text-white flex-col justify-between relative overflow-hidden">
        {/* Background glow ornaments */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">EduSphere</h2>
            <p className="text-xs text-blue-200">AI-Powered IELTS Mastery</p>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="space-y-6 relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Personalized IELTS Roadmap</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
            Start your journey towards IELTS Band 7.5+ today.
          </h1>

          <p className="text-sm text-blue-100/80 leading-relaxed">
            Create an account to access custom study paths, simulated computer-delivered test environments, and comprehensive AI analytics.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 space-y-1">
              <Target className="w-5 h-5 text-amber-300" />
              <h4 className="text-xs font-bold">Targeted Band</h4>
              <p className="text-[11px] text-blue-200">Set precise targets from 6.0 to 8.5+</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 space-y-1">
              <Zap className="w-5 h-5 text-emerald-300" />
              <h4 className="text-xs font-bold">Fast Evaluation</h4>
              <p className="text-[11px] text-blue-200">Realtime grading in under 5 seconds</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-2 text-xs text-blue-200/60 relative z-10">
          <ShieldCheck className="w-4 h-4" />
          <span>Enterprise Grade Security & Token Rotation</span>
        </div>
      </div>

      {/* Right form column */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center md:text-left space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Create your account
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Join EduSphere and unlock AI-powered IELTS preparation.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  )
}
