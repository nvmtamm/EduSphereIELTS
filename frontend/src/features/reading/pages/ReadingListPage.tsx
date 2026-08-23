import React, { useEffect, useState } from 'react'
import { BookOpen, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react'
import { readingApi } from '../api/readingApi'
import type { ReadingPassageItem } from '../types/reading.types'
import { ExamTable } from '../components/ExamTable'

export const ReadingListPage: React.FC = () => {
  const [passages, setPassages] = useState<ReadingPassageItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPassages = async () => {
      try {
        setLoading(true)
        const res = await readingApi.getPassages({ page: 1, pageSize: 20 })
        setPassages(res.items)
      } catch (err) {
        console.error('Failed to load passages', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPassages()
  }, [])

  return (
    <div className="space-y-6">
      {/* Banner / Header - Pure Red */}
      <div className="relative overflow-hidden rounded-3xl bg-red-600 p-6 md:p-8 text-white shadow-xl shadow-red-600/20">
        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 backdrop-blur-md text-xs font-bold text-white">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Cambridge Academic Standard 2026</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            IELTS Reading Practice Hub
          </h1>
          <p className="text-red-50 text-xs md:text-sm leading-relaxed font-medium">
            Practice authentic Academic Reading passages with our split-screen test interface, instant scoring engine, and paragraph-by-paragraph explanations.
          </p>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-black/10 blur-2xl pointer-events-none" />
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider">Available Passages</span>
            <p className="text-lg font-black text-zinc-950 dark:text-white">{passages.length} Topics</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider">Auto-Grading Engine</span>
            <p className="text-lg font-black text-zinc-950 dark:text-white">Cambridge Band 1-9</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider">Target Score</span>
            <p className="text-lg font-black text-zinc-950 dark:text-white">Band 7.5+ Ready</p>
          </div>
        </div>
      </div>

      {/* Main Exam Table */}
      <ExamTable data={passages} loading={loading} />
    </div>
  )
}
