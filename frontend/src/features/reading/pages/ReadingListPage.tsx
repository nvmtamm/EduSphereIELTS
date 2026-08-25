import React, { useEffect, useState } from 'react'
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Compass, 
  Database, 
  UploadCloud, 
  Bot, 
  Layers,
  Search,
  ArrowRight,
  Filter,
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
  const [vaultViewMode, setVaultViewMode] = useState<'grid' | 'table'>('table')
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
    { key: 'all', label: 'All Exam Repositories', count: passages.length },
    { key: 'OfficialCambridge', label: 'Cambridge Official (Vol 10–20)', badge: 'Gold' },
    { key: 'PastActualTest', label: 'Past Actual Tests (2020–2026)', badge: 'IDP/BC' },
    { key: 'PublisherSeries', label: 'Publisher Series', badge: 'Collins/Barron' },
    { key: 'UserUploaded', label: 'Personal Test Vault', badge: 'My Uploads' },
    { key: 'AIGenerated', label: 'AI Adaptive Bank', badge: 'Generative' }
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
      const res = await readingApi.getPassages({
        page: 1,
        pageSize: 50,
        sourceType: selectedSourceType !== 'all' ? selectedSourceType : undefined,
        targetBandTier: selectedBandFilter !== 'all' ? selectedBandFilter : undefined,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
        search: searchTerm.trim() || undefined
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
      {/* Banner / Header Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-indigo-700 p-6 md:p-8 text-white shadow-2xl shadow-red-600/20">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/25 backdrop-blur-md text-xs font-bold text-white border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Cambridge Academic Standard 2026 • Harness Core Multi-Agent</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
            IELTS Reading Mastery & AI Ecosystem
          </h1>

          <p className="text-red-50 text-xs md:text-sm leading-relaxed font-medium">
            Conquer your target Band through 6 dedicated milestone roadmaps, practice with official Cambridge & Past Actual exam repositories, or upload your own files to let our 4-Agent Pipeline build custom tests instantly.
          </p>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 font-bold text-xs shadow-lg flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-purple-600" />
              Upload Custom Exam (AI Multi-Agent)
            </button>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      </div>

      {/* Primary View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2 flex-wrap gap-4">
        <div className="flex items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'roadmap'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            Milestone Roadmaps (Band 0 $\rightarrow$ 8.5+)
          </button>

          <button
            onClick={() => setActiveTab('vaults')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'vaults'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            Exam Repositories & Vaults
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'vaults' && (
            <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setVaultViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  vaultViewMode === 'table'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
                title="Table View (TanStack Data Table)"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setVaultViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  vaultViewMode === 'grid'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
                title="Cards Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/20 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            AI Ingest Tool
          </button>
        </div>
      </div>

      {/* TAB 1: ROADMAP JOURNEY VIEW */}
      {activeTab === 'roadmap' ? (
        <ReadingRoadmapHub roadmaps={roadmaps} loading={loadingRoadmaps} />
      ) : (
        /* TAB 2: MULTI-REPOSITORY VAULTS VIEW */
        <div className="space-y-6">
          {/* Source Type Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {sourceTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedSourceType(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                  selectedSourceType === tab.key
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-md'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {vaultViewMode === 'table' ? (
            /* Enterprise TanStack Data Table View */
            <ExamTable data={passages} loading={loadingPassages} />
          ) : (
            /* Cards Grid View */
            <div className="space-y-6">
              {/* Filter Toolbar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="relative sm:col-span-2">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search test title, academic topic, or collection..."
                    className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <select
                    value={selectedBandFilter}
                    onChange={(e) => setSelectedBandFilter(e.target.value)}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="all">All Target Bands</option>
                    <option value="PreIelts">Pre-IELTS (Band 0–3.5)</option>
                    <option value="Band4_0_4_5">Band 4.0–4.5</option>
                    <option value="Band5_0_5_5">Band 5.0–5.5</option>
                    <option value="Band6_0_6_5">Band 6.0–6.5</option>
                    <option value="Band7_0_7_5">Band 7.0–7.5</option>
                    <option value="Band8_0_Plus">Band 8.0–8.5+</option>
                  </select>
                </div>

                <div>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="Easy">Easy (Passage 1)</option>
                    <option value="Medium">Medium (Passage 2)</option>
                    <option value="Hard">Hard (Passage 3)</option>
                  </select>
                </div>
              </div>

              {/* Passages Cards Grid */}
              {loadingPassages ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
                  <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm">Loading authentic IELTS Reading tests...</p>
                </div>
              ) : passages.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40 text-zinc-400" />
                  <p className="text-base font-bold text-zinc-900 dark:text-white">No passages found in this vault</p>
                  <p className="text-xs text-zinc-500 mt-1">Try clearing your filters or upload a custom exam file.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {passages.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl shadow-xs transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900">
                            {item.collectionName}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            item.difficulty === 'Hard'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : item.difficulty === 'Medium'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {item.difficulty}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                          {item.title}
                        </h3>

                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          {item.topic}
                        </p>

                        <div className="flex items-center gap-1.5 flex-wrap mt-3">
                          {item.questionTypes.map((qType, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
                            >
                              {qType}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                        <span className="text-xs text-zinc-400 font-medium">
                          {item.totalQuestions} Questions • {item.estimatedTimeMinutes} mins
                        </span>

                        <button
                          onClick={() => navigate(`/reading/exam/${item.id}`)}
                          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          Take Test
                        </button>
                      </div>
                    </div>
                  ))}
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
