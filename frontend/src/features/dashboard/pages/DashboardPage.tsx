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
    { title: 'Reading Practice', desc: 'True/False/Not Given, Heading Matching with timer', icon: BookOpen, path: '/reading', color: 'from-blue-500 to-indigo-600', band: 'Band 7.0' },
    { title: 'Listening Hub', desc: 'Audio streaming with synchronized highlighted transcripts', icon: Headphones, path: '/listening', color: 'from-purple-500 to-pink-600', band: 'Band 7.5' },
    { title: 'Writing AI Grader', desc: 'Task 1 & Task 2 instant scoring with IELTS Band Descriptors', icon: PenTool, path: '/writing', color: 'from-amber-500 to-orange-600', band: 'Band 6.5' },
    { title: 'Speaking Examiner', desc: 'Voice recording with pronunciation and fluency analytics', icon: Mic, path: '/speaking', color: 'from-emerald-500 to-teal-600', band: 'Band 7.0' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-xl shadow-blue-500/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
            <Flame className="w-4 h-4 text-amber-300" />
            <span>3-Day Learning Streak 🔥</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight">
            Hello, {user?.fullName || 'Student'}! 👋
          </h1>

          <p className="text-sm text-blue-100/90 leading-relaxed">
            Your target is <span className="font-bold underline">Band {user?.targetBandScore?.toFixed(1) || '7.5'}</span>. Complete today's recommended practice modules to stay on track for your exam target.
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Target Score</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
              Band {user?.targetBandScore?.toFixed(1) || '7.5'}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Current Estimate</p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">Band 7.0</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Vocabulary Mastered</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">240 Words</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Mock Tests Taken</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">4 Tests</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4 Skills Hub Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          Core IELTS Skills Practice
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {skillCards.map((skill) => {
            const Icon = skill.icon
            return (
              <div
                key={skill.title}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${skill.color} text-white flex items-center justify-center shadow-lg shadow-blue-500/10`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs">
                    {skill.band}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {skill.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {skill.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Launch Module</span>
                  <Link
                    to={skill.path}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white transition-colors"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
