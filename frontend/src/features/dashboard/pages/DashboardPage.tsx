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
    { title: 'Reading Practice', desc: 'True/False/Not Given, Heading Matching with split-screen timer', icon: BookOpen, path: '/reading', band: 'Band 7.0' },
    { title: 'Listening Hub', desc: 'Audio streaming with synchronized highlighted transcripts', icon: Headphones, path: '/listening', band: 'Band 7.5' },
    { title: 'Writing AI Grader', desc: 'Task 1 & Task 2 instant scoring with IELTS Band Descriptors', icon: PenTool, path: '/writing', band: 'Band 6.5' },
    { title: 'Speaking Examiner', desc: 'Voice recording with pronunciation and fluency analytics', icon: Mic, path: '/speaking', band: 'Band 7.0' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Banner - Bold Pure Red */}
      <div className="p-8 rounded-3xl bg-red-600 text-white shadow-xl shadow-red-600/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/25 backdrop-blur-md text-xs font-bold text-white">
            <Flame className="w-4 h-4 text-white" />
            <span>3-Day Learning Streak</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight">
            Hello, {user?.fullName || 'Student'}! 👋
          </h1>

          <p className="text-sm text-red-50 leading-relaxed font-medium">
            Your target is <span className="font-black underline">Band {user?.targetBandScore?.toFixed(1) || '7.5'}</span>. Complete today's recommended practice modules to stay on track for your official exam.
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Target Score</p>
            <h3 className="text-2xl font-black text-zinc-950 dark:text-white mt-1">
              Band {user?.targetBandScore?.toFixed(1) || '7.5'}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-red-600 dark:text-red-500 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Current Estimate</p>
            <h3 className="text-2xl font-black text-red-600 dark:text-red-500 mt-1">Band 7.0</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-red-600 dark:text-red-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Vocabulary</p>
            <h3 className="text-2xl font-black text-zinc-950 dark:text-white mt-1">240 Words</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-red-600 dark:text-red-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Mock Tests</p>
            <h3 className="text-2xl font-black text-zinc-950 dark:text-white mt-1">4 Tests</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-red-600 dark:text-red-500 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4 Skills Hub Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-zinc-950 dark:text-white">
          Core IELTS Skills Practice
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {skillCards.map((skill) => {
            const Icon = skill.icon
            return (
              <div
                key={skill.title}
                className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-red-600 dark:hover:border-red-600 transition-all group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold text-xs">
                    {skill.band}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                    {skill.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    {skill.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between">
                  <span className="text-xs font-bold text-red-600 dark:text-red-500">Launch Module</span>
                  <Link
                    to={skill.path}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 group-hover:bg-red-600 group-hover:text-white text-zinc-700 dark:text-zinc-300 transition-colors"
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
