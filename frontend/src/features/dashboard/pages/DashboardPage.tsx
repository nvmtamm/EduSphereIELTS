import React from 'react'
import { useAuth } from '@/shared/hooks/useAuth'
import {
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Sparkles,
  Award,
  TrendingUp,
  Target,
  ArrowUpRight,
  Flame
} from 'lucide-react'
import { Link } from 'react-router-dom'

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()

  const skillCards = [
    { 
      title: 'Reading Practice', 
      desc: 'True/False/Not Given, Heading Matching with split-screen exam mode', 
      icon: BookOpen, 
      path: '/reading', 
      band: 'Band 7.0',
      iconBg: 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
    },
    { 
      title: 'Listening Hub', 
      desc: 'Audio streaming with synchronized highlighted transcripts', 
      icon: Headphones, 
      path: '/listening', 
      band: 'Band 7.5',
      iconBg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
    },
    { 
      title: 'Writing AI Grader', 
      desc: 'Task 1 & Task 2 instant scoring with official IELTS Band Descriptors', 
      icon: PenTool, 
      path: '/writing', 
      band: 'Band 6.5',
      iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
    },
    { 
      title: 'Speaking Examiner', 
      desc: 'Voice recording with pronunciation and fluency analytics', 
      icon: Mic, 
      path: '/speaking', 
      band: 'Band 7.0',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Banner - Brand Red & Deep Slate */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-slate-900 text-white shadow-xl shadow-red-600/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/25 backdrop-blur-md text-xs font-bold text-white border border-white/15">
            <Flame className="w-4 h-4 text-amber-300" />
            <span>3-Day Learning Streak</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Hello, {user?.fullName || 'Student'}! 👋
          </h1>

          <p className="text-sm text-red-50 leading-relaxed font-medium">
            Your target goal is <span className="font-black text-white underline">Band {user?.targetBandScore?.toFixed(1) || '7.5'}</span>. Complete today's recommended modules to stay on track for your official exam.
          </p>
        </div>
      </div>

      {/* Quick Stats Grid with Gentle Tint Backgrounds */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Score</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Band {user?.targetBandScore?.toFixed(1) || '7.5'}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Estimate</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Band 7.0</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vocabulary</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">240 Words</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mock Tests</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">4 Tests</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4 Core Skills Practice Hub Grid (80% Content Pastel) */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">
          Core IELTS Skills Practice
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {skillCards.map((skill) => {
            const Icon = skill.icon
            return (
              <Link
                key={skill.title}
                to={skill.path}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-red-500 hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 ${skill.iconBg}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
                      {skill.band}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-red-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-all">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">
                    {skill.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-normal">
                    {skill.desc}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
