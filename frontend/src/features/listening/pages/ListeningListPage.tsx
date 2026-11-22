import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, LayoutGrid, Table as TableIcon, Clock, Headphones } from 'lucide-react'
import { listeningApi } from '../api/listeningApi'
import type { ListeningTest } from '../types/listening'
import { ListeningExplorerTable } from '../components/ListeningExplorerTable'
import { formatAudioTime } from '../utils/listeningScoring'
import { StatusBadge, difficultyTone } from '@/shared/components/Feedback'

const sectionTabs: { key: number | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 0, label: 'Full tests' },
  { key: 1, label: 'Part 1 · Conversation' },
  { key: 2, label: 'Part 2 · Monologue' },
  { key: 3, label: 'Part 3 · Discussion' },
  { key: 4, label: 'Part 4 · Lecture' }
]

const accentOptions = [
  { key: 'all', label: 'All accents' },
  { key: 'British', label: 'British' },
  { key: 'Australian', label: 'Australian' },
  { key: 'American', label: 'American' },
  { key: 'Mixed', label: 'Mixed' }
]

const selectClass =
  'px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:border-red-500 cursor-pointer'

export const ListeningListPage: React.FC = () => {
  const navigate = useNavigate()

  const [tests, setTests] = useState<ListeningTest[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const [selectedSection, setSelectedSection] = useState<number | 'all'>('all')
  const [selectedAccent, setSelectedAccent] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listeningApi
      .getTests({
        page: 1,
        pageSize: 50,
        sectionNumber: selectedSection !== 'all' ? selectedSection : undefined,
        accent: selectedAccent !== 'all' ? selectedAccent : undefined,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
        search: searchTerm.trim() || undefined
      })
      .then((res) => { if (!cancelled) setTests(res.items) })
      .catch((err) => console.error('Failed to load listening tests:', err))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [selectedSection, selectedAccent, selectedDifficulty, searchTerm])

  // Featured full test only when browsing everything
  const { featuredTest, regularTests } = useMemo(() => {
    if (selectedSection !== 'all') return { featuredTest: null, regularTests: tests }
    const full = tests.find((t) => t.sectionType === 'FullTest_4Sections' || t.sectionNumber === 0)
    return { featuredTest: full || null, regularTests: tests.filter((t) => t.id !== full?.id) }
  }, [tests, selectedSection])

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">IELTS Listening</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Practise with full tests or single parts. You can switch between practice and real-exam mode before each test.
        </p>
      </div>

      {/* Section tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        {sectionTabs.map((tab) => {
          const active = selectedSection === tab.key
          return (
            <button
              key={String(tab.key)}
              type="button"
              onClick={() => setSelectedSection(tab.key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors cursor-pointer ${
                active
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or topic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-red-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>

        <select value={selectedAccent} onChange={(e) => setSelectedAccent(e.target.value)} className={selectClass} aria-label="Accent">
          {accentOptions.map((a) => (
            <option key={a.key} value={a.key}>{a.label}</option>
          ))}
        </select>

        <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} className={selectClass} aria-label="Level">
          <option value="all">All levels</option>
          <option value="Easy">Easy (Band 5.0–6.0)</option>
          <option value="Medium">Medium (Band 6.5–7.0)</option>
          <option value="Hard">Hard (Band 7.5–9.0)</option>
        </select>

        <div className="ml-auto flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5">
          {([['grid', LayoutGrid, 'Grid view'], ['table', TableIcon, 'Table view']] as const).map(([mode, Icon, title]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              title={title}
              className={`p-2 rounded-md cursor-pointer ${
                viewMode === mode ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'table' ? (
        <ListeningExplorerTable data={tests} isLoading={loading} />
      ) : loading ? (
        <p className="py-16 text-center text-sm text-slate-500">Loading tests…</p>
      ) : tests.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl">
          <Headphones className="w-10 h-10 mx-auto text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">No tests found</p>
          <p className="text-sm text-slate-500 mt-1">Try another part, accent or level, or clear the search.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {featuredTest && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Full test · 4 parts</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{featuredTest.title}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{featuredTest.topic}</p>
                <p className="text-sm text-slate-500 mt-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {formatAudioTime(featuredTest.durationSeconds)} · {featuredTest.totalQuestions} questions · {featuredTest.collectionName}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate(`/listening/dictation/${featuredTest.id}`)}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  title="Type what you hear from this test's audio"
                >
                  Dictation
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/listening/exam/${featuredTest.id}`)}
                  className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold cursor-pointer"
                >
                  Start full test
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {regularTests.map((test) => {
              const isFull = test.sectionType === 'FullTest_4Sections' || test.sectionNumber === 0
              const types = (test.questionTypes ?? []).slice(0, 3).join(' · ')
              return (
                <div key={test.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-slate-500">
                        {isFull ? 'Full test' : `Part ${test.sectionNumber}`} · {test.accent} accent
                      </p>
                      {test.difficulty && <StatusBadge tone={difficultyTone(test.difficulty)}>{test.difficulty}</StatusBadge>}
                    </div>
                    <h3 className="mt-1.5 text-base font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2">{test.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2">{test.topic}</p>
                    {types && <p className="text-xs text-slate-500 mt-3">{types}</p>}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-sm text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> {formatAudioTime(test.durationSeconds)} · {test.totalQuestions} Qs
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/listening/dictation/${test.id}`)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                        title="Dictation practice"
                      >
                        Dictation
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/listening/exam/${test.id}`)}
                        className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold cursor-pointer"
                      >
                        Start
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
