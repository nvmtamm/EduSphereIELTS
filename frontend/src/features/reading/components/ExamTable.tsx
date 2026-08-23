import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowUpDown, Clock, BookOpen, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import type { ReadingPassageItem } from '../types/reading.types'

interface ExamTableProps {
  data: ReadingPassageItem[]
  loading?: boolean
}

type SortField = 'title' | 'difficulty' | 'estimatedTimeMinutes' | 'createdAt'
type SortOrder = 'asc' | 'desc'

export const ExamTable: React.FC<ExamTableProps> = ({ data, loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // Filter & Search
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchDiff =
        selectedDifficulty === 'ALL' ||
        item.difficulty.toUpperCase() === selectedDifficulty.toUpperCase()
      const matchSearch =
        !searchTerm.trim() ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.topic.toLowerCase().includes(searchTerm.toLowerCase())
      return matchDiff && matchSearch
    })
  }, [data, selectedDifficulty, searchTerm])

  // Sort
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let comparison = 0
      if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title)
      } else if (sortField === 'difficulty') {
        comparison = a.difficulty.localeCompare(b.difficulty)
      } else if (sortField === 'estimatedTimeMinutes') {
        comparison = a.estimatedTimeMinutes - b.estimatedTimeMinutes
      } else if (sortField === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [filteredData, sortField, sortOrder])

  // Pagination
  const totalPages = Math.max(Math.ceil(sortedData.length / pageSize), 1)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize])

  const getDifficultyBadge = (diff: string) => {
    if (diff === 'Hard') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-red-600 text-white">
          {diff}
        </span>
      )
    }
    if (diff === 'Medium') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950">
          {diff}
        </span>
      )
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
        {diff}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table Toolbar / Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search IELTS passages by title or topic..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
          />
        </div>

        {/* Difficulty Filter Badges */}
        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
          {['ALL', 'Easy', 'Medium', 'Hard'].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => {
                setSelectedDifficulty(lvl)
                setCurrentPage(1)
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedDifficulty.toUpperCase() === lvl.toUpperCase()
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
                <th className="py-3 px-5 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  <button
                    type="button"
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-1.5 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <span>Passage Title</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-5 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  <button
                    type="button"
                    onClick={() => handleSort('difficulty')}
                    className="flex items-center gap-1.5 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <span>Difficulty</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-5 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  <button
                    type="button"
                    onClick={() => handleSort('estimatedTimeMinutes')}
                    className="flex items-center gap-1.5 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <span>Duration</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-5 text-xs font-bold text-zinc-600 dark:text-zinc-400 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-zinc-400">
                    Loading IELTS passages from database...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-zinc-400">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40 text-zinc-400" />
                    <p className="text-xs font-semibold">No IELTS Reading passages match your filter.</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors"
                  >
                    <td className="py-3.5 px-5 text-xs">
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-zinc-950 dark:text-white text-xs sm:text-sm hover:text-red-600 dark:hover:text-red-500 transition-colors">
                          {row.title}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                          <span>{row.topic}</span>
                          <span>•</span>
                          <span>{row.totalQuestions} questions</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-xs">
                      {getDifficultyBadge(row.difficulty)}
                    </td>
                    <td className="py-3.5 px-5 text-xs">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{row.estimatedTimeMinutes} mins</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-right">
                      <Link
                        to={`/reading/exam/${row.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/25 transition-all hover:scale-105"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Start Test</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-500">
          <div>
            Page {currentPage} of {totalPages} ({sortedData.length} items)
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-zinc-900 dark:text-zinc-100"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-zinc-900 dark:text-zinc-100"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
