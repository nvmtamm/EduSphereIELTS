import React, { useEffect, useState } from 'react'
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
import { Banner, IconTile } from '@/shared/components/Feedback'
import { learningPathApi } from '@/features/learningpath/api/learningPathApi'

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [nextLesson, setNextLesson] = useState<{ code: string; title: string } | null>(null)

  useEffect(() => {
    learningPathApi
      .getPath()
      .then((p) => {
        const next = p.stages.flatMap((s) => s.lessons).find((l) => !l.completed)
        if (next) setNextLesson({ code: next.code, title: next.title })
      })
      .catch(() => setNextLesson(null))
  }, [])

  const skillCards = [
    { 
      title: 'Reading Practice', 
      desc: 'True/False/Not Given, Heading Matching with split-screen exam mode', 
      icon: BookOpen, 
      path: '/reading', 
      band: 'Band 7.0',
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
    },
    { 
      title: 'Listening Hub', 
      desc: 'Audio streaming with synchronized highlighted transcripts', 
      icon: Headphones, 
      path: '/listening', 
      band: 'Band 7.5',
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
    },
    { 
      title: 'Writing AI Grader', 
      desc: 'Task 1 & Task 2 instant scoring with official IELTS Band Descriptors', 
      icon: PenTool, 
      path: '/writing', 
      band: 'Band 6.5',
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
    },
    { 
      title: 'Speaking Examiner', 
      desc: 'Voice recording with pronunciation and fluency analytics', 
      icon: Mic, 
      path: '/speaking', 
      band: 'Band 7.0',
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
    },
  ]

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="space-y-1">
        <p className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500">
          <Flame className="w-4 h-4" /> 3-day learning streak
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Hello, {user?.fullName || 'Student'}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Your target is <span className="font-semibold text-slate-900 dark:text-white">Band {user?.targetBandScore?.toFixed(1) || '7.5'}</span>. Pick up where you left off below.
        </p>
      </div>

      {nextLesson && (
        <Banner
          tone="warn"
          action={
            <Link to={`/learning-path/${nextLesson.code}`} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold">
              Continue
            </Link>
          }
        >
          <span className="font-semibold">Next lesson · {nextLesson.code}</span> — {nextLesson.title}
        </Banner>
      )}

      {/* Quick Stats Grid with Gentle Tint Backgrounds */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">Target Score</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Band {user?.targetBandScore?.toFixed(1) || '7.5'}
            </h3>
          </div>
          <IconTile tone="red"><Target className="w-5 h-5" /></IconTile>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">Current Estimate</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">Band 7.0</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">Vocabulary</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">240 Words</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">Mock Tests</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">4 Tests</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4 Core Skills Practice Hub Grid (80% Content Pastel) */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Core IELTS skills practice
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {skillCards.map((skill) => {
            const Icon = skill.icon
            return (
              <Link
                key={skill.title}
                to={skill.path}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-red-500 hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 ${skill.iconBg}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold text-xs">
                      {skill.band}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-red-50 group-hover:text-red-600 text-slate-400 flex items-center justify-center transition-all">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">
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
