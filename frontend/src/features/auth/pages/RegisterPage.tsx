import React from 'react'
import { RegisterForm } from '../components/RegisterForm'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { GraduationCap, Sparkles, Target, Zap, ShieldCheck } from 'lucide-react'

export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-black">
      {/* Top right theme toggle */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      {/* Left branding & features column - Jet Black & Pure Red */}
      <div className="hidden md:flex md:w-1/2 p-12 bg-black text-white flex-col justify-between relative overflow-hidden border-r border-zinc-800">
        {/* Background red glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Edu<span className="text-red-600">Sphere</span></h2>
            <p className="text-xs text-zinc-400 font-bold">IELTS OFFICIAL PREP</p>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="space-y-6 relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-white">
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            <span>Personalized IELTS Roadmap</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight leading-tight">
            Start your journey towards IELTS Band 7.5+ today.
          </h1>

          <p className="text-sm text-zinc-300 leading-relaxed font-normal">
            Create an account to access custom study paths, simulated computer-delivered test environments, and comprehensive AI analytics.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <Target className="w-5 h-5 text-red-500" />
              <h4 className="text-xs font-bold text-white">Targeted Band</h4>
              <p className="text-[11px] text-zinc-400">Set precise targets from 6.0 to 8.5+</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <Zap className="w-5 h-5 text-red-500" />
              <h4 className="text-xs font-bold text-white">Fast Evaluation</h4>
              <p className="text-[11px] text-zinc-400">Realtime grading in under 5 seconds</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 relative z-10 font-bold">
          <ShieldCheck className="w-4 h-4 text-red-600" />
          <span>Enterprise Grade Security & Token Rotation</span>
        </div>
      </div>

      {/* Right form column */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center md:text-left space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
              Create your account
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Join EduSphere and unlock AI-powered IELTS preparation.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  )
}
