import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../api/adminApi'
import type { AdminDashboardStats } from '../types/admin.types'
import { AdminStatCard } from '../components/AdminStatCard'
import {
  Users,
  FileCheck,
  Award,
  Database,
  ArrowRight,
  BookOpen,
  Headphones,
  PenTool,
  Loader2,
  Clock,
  Sparkles
} from 'lucide-react'

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const data = await adminApi.getDashboardStats()
      setStats(data)
    } catch (err) {
      console.error('Failed to load admin stats', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <span className="text-sm font-semibold">Loading Admin Analytics & KPIs...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black bg-red-600 text-white">
              Backoffice Administration
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
            System & Learning Observability
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Real-time analytics across learners, 3-skill exam submissions, and AI evaluation engines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/users"
            className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold hover:bg-zinc-800 transition-colors"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/exam-bank"
            className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold transition-colors"
          >
            Manage Content Bank
          </Link>
        </div>
      </div>

      {/* 4 Core KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <AdminStatCard
          title="Total Registered Learners"
          value={stats?.totalLearners ?? 0}
          subtitle="Active academic candidates"
          icon={Users}
          trend="+12%"
          trendPositive={true}
        />
        <AdminStatCard
          title="Total Exams Completed"
          value={stats?.totalSubmissions ?? 0}
          subtitle="Reading, Listening & Writing"
          icon={FileCheck}
          trend="+28%"
          trendPositive={true}
        />
        <AdminStatCard
          title="Average System Band"
          value={stats?.averageBandScore ? `Band ${stats.averageBandScore.toFixed(1)}` : 'Band 6.5'}
          subtitle="Official Cambridge scaling"
          icon={Award}
          trend="+0.3 band"
          trendPositive={true}
        />
        <AdminStatCard
          title="Total Exam Prompts"
          value={(stats?.totalReadingPassages ?? 0) + (stats?.totalListeningTests ?? 0) + (stats?.totalWritingPrompts ?? 0)}
          subtitle="Across 3 IELTS skills"
          icon={Database}
        />
      </div>

      {/* Content Bank Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-zinc-400 font-bold uppercase">Reading Passages</span>
              <div className="text-2xl font-black text-zinc-950 dark:text-white">
                {stats?.totalReadingPassages ?? 0}
              </div>
            </div>
          </div>
          <Link
            to="/reading"
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-zinc-400 font-bold uppercase">Listening Tests</span>
              <div className="text-2xl font-black text-zinc-950 dark:text-white">
                {stats?.totalListeningTests ?? 0}
              </div>
            </div>
          </div>
          <Link
            to="/listening"
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-600/10 text-red-600 flex items-center justify-center">
              <PenTool className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-zinc-400 font-bold uppercase">Writing Prompts</span>
              <div className="text-2xl font-black text-zinc-950 dark:text-white">
                {stats?.totalWritingPrompts ?? 0}
              </div>
            </div>
          </div>
          <Link
            to="/writing"
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Recent Learner Submissions Activity Feed */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-zinc-950 dark:text-white text-base">
            <Clock className="w-5 h-5 text-red-600" />
            <span>Recent Exam Submissions</span>
          </div>
          <span className="text-xs text-zinc-400">Live Activity Feed</span>
        </div>

        {stats?.recentActivities && stats.recentActivities.length > 0 ? (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {stats.recentActivities.map((act) => (
              <div key={act.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      act.examType === 'Writing'
                        ? 'bg-red-600/10 text-red-600'
                        : act.examType === 'Listening'
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-blue-500/10 text-blue-600'
                    }`}
                  >
                    {act.examType[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                      {act.title}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {act.studentName} ({act.studentEmail})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-black text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                    Band {act.bandScore.toFixed(1)}
                  </span>
                  <span className="text-[11px] text-zinc-400 hidden sm:inline">
                    {new Date(act.submittedAt).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-zinc-400">
            No recent submissions recorded yet.
          </div>
        )}
      </div>
    </div>
  )
}
