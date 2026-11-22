import React, { useEffect, useState } from 'react'
import { 
  BookOpen, 
  UploadCloud, 
  Search, 
  Play, 
  LayoutGrid, 
  Table as TableIcon
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { readingApi } from '../api/readingApi'
import type { ReadingPassageItem, BandRoadmap, DocumentIngestResult } from '../types/reading.types'
import { ReadingRoadmapHub } from '../components/ReadingRoadmapHub'
import { DocumentUploadModal } from '../components/DocumentUploadModal'
import { ExamTable } from '../components/ExamTable'
import { StatusBadge, difficultyTone } from '@/shared/components/Feedback'

export const ReadingListPage: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'roadmap' | 'vaults'>('roadmap')
  const [vaultViewMode, setVaultViewMode] = useState<'table' | 'grid'>('table')
  const [passages, setPassages] = useState<ReadingPassageItem[]>([])
  const [roadmaps, setRoadmaps] = useState<BandRoadmap[]>([])
  const [loadingPassages, setLoadingPassages] = useState<boolean>(true)
  const [loadingRoadmaps, setLoadingRoadmaps] = useState<boolean>(true)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false)

  // Vaults Filters
  const [selectedSourceType, setSelectedSourceType] = useState<string>('all')
  const [selectedBandFilter, setSelectedBandFilter] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'todo' | 'done'>('all')
  const [completedIds] = useState<Set<string>>(() => {
    try {
      return new Set<string>(JSON.parse(localStorage.getItem('reading.completedPassages') ?? '[]'))
    } catch {
      return new Set<string>()
    }
  })

  const questionTypeOptions = Array.from(new Set(passages.flatMap((p) => p.questionTypes))).sort()
  const visiblePassages = passages.filter((p) => {
    if (selectedQuestionType !== 'all' && !p.questionTypes.includes(selectedQuestionType as never)) return false
    if (selectedStatus === 'done' && !completedIds.has(p.id)) return false
    if (selectedStatus === 'todo' && completedIds.has(p.id)) return false
    return true
  })

  const sourceTabs = [
    { key: 'all', label: 'All Collections' },
    { key: 'OfficialCambridge', label: 'Cambridge Official (Vol 10–20)' },
    { key: 'PastActualTest', label: 'Past Actual Tests (2020–2026)' },
    { key: 'PublisherSeries', label: 'Publisher Practice Series' },
    { key: 'UserUploaded', label: 'Personal Test Vault' },
  ]

  useEffect(() => {
    fetchRoadmaps()
    fetchPassages()
  }, [])

  const fetchRoadmaps = async () => {
    try {
      setLoadingRoadmaps(true)
      const res = await readingApi.getRoadmaps()
      setRoadmaps(res)
    } catch (err) {
      console.error('Failed to load band roadmaps', err)
    } finally {
      setLoadingRoadmaps(false)
    }
  }

  const fetchPassages = async () => {
    try {
      setLoadingPassages(true)
      const isPersonal = selectedSourceType === 'UserUploaded'
      const res = await readingApi.getPassages({
        page: 1,
        pageSize: 50,
        sourceType: selectedSourceType !== 'all' ? selectedSourceType : undefined,
        targetBandTier: selectedBandFilter !== 'all' ? selectedBandFilter : undefined,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
        search: searchTerm.trim() || undefined,
        isPersonalOnly: isPersonal ? true : undefined
      })
      setPassages(res.items)
    } catch (err) {
      console.error('Failed to load passages', err)
    } finally {
      setLoadingPassages(false)
    }
  }

  useEffect(() => {
    fetchPassages()
  }, [selectedSourceType, selectedBandFilter, selectedDifficulty, searchTerm])

  const handleUploadSuccess = (result: DocumentIngestResult) => {
    fetchPassages()
    navigate(`/reading/exam/${result.passageId}`)
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. Sleek, Professional Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1">

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            IELTS Reading Practice
          </h1>

          <p className="text-sm md:text-[15px] text-slate-600 dark:text-slate-400 font-normal max-w-3xl leading-relaxed">
            Master IELTS Academic Reading through structured Band Roadmaps or explore authentic exam repositories.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Custom Exam</span>
          </button>
        </div>
      </div>

      {/* Primary tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
        {([['roadmap', 'Roadmaps'], ['vaults', `Exam library (${passages.length})`]] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px cursor-pointer transition-colors ${
              activeTab === key
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TAB 1: GAMIFIED ROADMAP ADVENTURE VIEW */}
      {activeTab === 'roadmap' ? (
        <ReadingRoadmapHub roadmaps={roadmaps} loading={loadingRoadmaps} />
      ) : (
        /* TAB 2: MULTI-REPOSITORY VAULTS VIEW */
        <div className="space-y-6">
          {/* Collection tabs */}
          <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
            {sourceTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedSourceType(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px cursor-pointer transition-colors ${
                  selectedSourceType === tab.key
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* One filter row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or topic"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-red-500 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            {[
              { value: selectedBandFilter, set: setSelectedBandFilter, label: 'Band', options: [['all', 'All bands'], ['PreIelts', 'Pre-IELTS (0–3.5)'], ['Band4_0_4_5', 'Band 4.0–4.5'], ['Band5_0_5_5', 'Band 5.0–5.5'], ['Band6_0_6_5', 'Band 6.0–6.5'], ['Band7_0_7_5', 'Band 7.0–7.5'], ['Band8_0_Plus', 'Band 8.0–8.5+']] },
              { value: selectedDifficulty, set: setSelectedDifficulty, label: 'Level', options: [['all', 'All levels'], ['Easy', 'Easy'], ['Medium', 'Medium'], ['Hard', 'Hard']] },
              { value: selectedQuestionType, set: setSelectedQuestionType, label: 'Question type', options: [['all', 'All question types'], ...questionTypeOptions.map((t) => [t, t])] },
              { value: selectedStatus, set: (v: string) => setSelectedStatus(v as 'all' | 'todo' | 'done'), label: 'Status', options: [['all', 'All status'], ['todo', 'Not completed'], ['done', 'Completed']] }
            ].map((f) => (
              <select
                key={f.label}
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                aria-label={f.label}
                className="px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:border-red-500 cursor-pointer"
              >
                {f.options.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            ))}

            <div className="ml-auto flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5">
              {([['table', TableIcon, 'Table view'], ['grid', LayoutGrid, 'Card view']] as const).map(([mode, Icon, title]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setVaultViewMode(mode)}
                  title={title}
                  className={`p-2 rounded-md cursor-pointer ${
                    vaultViewMode === mode ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-slate-500">{visiblePassages.length} of {passages.length} tests</p>

          {vaultViewMode === 'table' ? (
            /* Enterprise TanStack Data Table View */
            <ExamTable data={visiblePassages} loading={loadingPassages} />
          ) : (
            /* Cards Grid View */
            <div className="space-y-6">
              {loadingPassages ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                  <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-medium">Loading authentic IELTS Reading tests...</p>
                </div>
              ) : visiblePassages.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
                  <p className="text-base font-bold text-slate-900 dark:text-white">No matching exams found in this vault</p>
                  <p className="text-xs text-slate-500 mt-1">Try clearing your filters or upload a custom exam file.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {visiblePassages.map((item) => {
                    const cleanTitle = item.title.startsWith('tiến hành dựa') 
                      ? 'Custom Uploaded Exam Practice' 
                      : item.title === '[Page 1]' 
                      ? `Personal Test - ${item.topic}` 
                      : item.title

                    return (
                      <div
                        key={item.id}
                        className="p-6 bg-white dark:bg-slate-900 border border-transparent hover:border-red-500 rounded-2xl shadow-xs transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-xs font-medium text-slate-500 truncate">{item.collectionName || 'Personal Vault'}</span>
                            <span className="flex items-center gap-1.5 shrink-0">
                              {completedIds.has(item.id) && <StatusBadge tone="success">Done</StatusBadge>}
                              <StatusBadge tone={difficultyTone(item.difficulty)}>{item.difficulty}</StatusBadge>
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                            {cleanTitle}
                          </h3>

                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                            {item.topic}
                          </p>

                          <div className="flex items-center gap-1.5 flex-wrap mt-3.5">
                            {item.questionTypes.map((qType, i) => (
                              <span
                                key={i}
                                className="text-[10.5px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700 font-medium"
                              >
                                {qType}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-xs text-slate-400 font-medium">
                            {item.totalQuestions || 13} Questions • {item.estimatedTimeMinutes || 20} mins
                          </span>

                          <button
                            onClick={() => navigate(`/reading/exam/${item.id}`)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-transform cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Start Test</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Document Ingestion Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  )
}
