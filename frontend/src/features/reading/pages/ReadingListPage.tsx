import React, { useEffect, useState } from 'react'
import { 
  BookOpen, 
  Sparkles, 
  Compass, 
  Database, 
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Cambridge Academic Standard • Official IELTS Preparation</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
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
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Custom Exam</span>
          </button>
        </div>
      </div>

      {/* 2. Prominent Primary Navigation Tabs */}
      <div className="p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`p-4 rounded-xl transition-all flex items-center gap-3.5 cursor-pointer text-left ${
            activeTab === 'roadmap'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <div className={`p-2.5 rounded-xl transition-colors ${
            activeTab === 'roadmap' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}>
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[14.5px] font-black flex items-center gap-2">
              <span>Milestone Roadmaps</span>
              <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200">Band 0 → 8.5+</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Step-by-step milestone journey to conquer your target score</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('vaults')}
          className={`p-4 rounded-xl transition-all flex items-center gap-3.5 cursor-pointer text-left ${
            activeTab === 'vaults'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <div className={`p-2.5 rounded-xl transition-colors ${
            activeTab === 'vaults' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}>
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[14.5px] font-black flex items-center gap-2">
              <span>Exam Repositories & Vaults</span>
              <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200">{passages.length} Tests</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Official Cambridge, Past Actual, and personal uploaded exams</p>
          </div>
        </button>
      </div>

      {/* TAB 1: GAMIFIED ROADMAP ADVENTURE VIEW */}
      {activeTab === 'roadmap' ? (
        <ReadingRoadmapHub roadmaps={roadmaps} loading={loadingRoadmaps} />
      ) : (
        /* TAB 2: MULTI-REPOSITORY VAULTS VIEW */
        <div className="space-y-6">
          {/* Collection Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {sourceTabs.map((tab) => {
              const isSelected = selectedSourceType === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedSourceType(tab.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Unified Filter Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search exam title, academic topic, or collection..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <select
                value={selectedBandFilter}
                onChange={(e) => setSelectedBandFilter(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-red-500 font-medium"
              >
                <option value="all">All Target Bands</option>
                <option value="PreIelts">Pre-IELTS (Band 0–3.5)</option>
                <option value="Band4_0_4_5">Band 4.0–4.5 (Elementary)</option>
                <option value="Band5_0_5_5">Band 5.0–5.5 (Intermediate)</option>
                <option value="Band6_0_6_5">Band 6.0–6.5 (Competent)</option>
                <option value="Band7_0_7_5">Band 7.0–7.5 (Advanced)</option>
                <option value="Band8_0_Plus">Band 8.0–8.5+ (Master)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-red-500 font-medium"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy (Passage 1)</option>
                <option value="Medium">Medium (Passage 2)</option>
                <option value="Hard">Hard (Passage 3)</option>
              </select>

              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 shrink-0">
                <button
                  onClick={() => setVaultViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    vaultViewMode === 'table'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Table View"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setVaultViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    vaultViewMode === 'grid'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Cards Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {vaultViewMode === 'table' ? (
            /* Enterprise TanStack Data Table View */
            <ExamTable data={passages} loading={loadingPassages} />
          ) : (
            /* Cards Grid View */
            <div className="space-y-6">
              {loadingPassages ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                  <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-medium">Loading authentic IELTS Reading tests...</p>
                </div>
              ) : passages.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
                  <p className="text-base font-bold text-slate-900 dark:text-white">No matching exams found in this vault</p>
                  <p className="text-xs text-slate-500 mt-1">Try clearing your filters or upload a custom exam file.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {passages.map((item) => {
                    const cleanTitle = item.title.startsWith('tiến hành dựa') 
                      ? 'Custom Uploaded Exam Practice' 
                      : item.title === '[Page 1]' 
                      ? `Personal Test - ${item.topic}` 
                      : item.title

                    return (
                      <div
                        key={item.id}
                        className="p-6 bg-white dark:bg-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-red-500 rounded-2xl shadow-xs transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-200">
                              {item.collectionName || 'Personal Vault'}
                            </span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              item.difficulty === 'Hard'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : item.difficulty === 'Medium'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {item.difficulty}
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
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
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
