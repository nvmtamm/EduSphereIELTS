import React from 'react'
import { LoginForm } from '../components/LoginForm'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { GraduationCap, CheckCircle2, Sparkles, Brain } from 'lucide-react'

export const LoginPage: React.FC = () => {
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
            <span>Next-Gen Band 7.5+ AI System</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight leading-tight">
            Accelerate your IELTS preparation with Intelligent RAG Grading.
          </h1>

          <p className="text-sm text-zinc-300 leading-relaxed font-normal">
            Practice Reading, Listening, Writing, and Speaking with instantaneous AI band evaluations aligned with official IELTS Band Descriptors.
          </p>

          <div className="space-y-3 pt-2">
            {[
              'RAG Evaluation with Qdrant Vector Search',
              'Adaptive SuperMemo SM-2 Vocabulary Retention',
              'Interactive AI Speaking & Pronunciation Examiner'
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5 text-xs text-zinc-200 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 relative z-10 font-bold">
          <Brain className="w-4 h-4 text-red-600" />
          <span>Powered by Microsoft Semantic Kernel & .NET 8</span>
        </div>
      </div>

      {/* Right form column */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center md:text-left space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
              Welcome back
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Enter your credentials to continue your IELTS preparation.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
