import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { Clock, Play, BookOpen, Layers } from 'lucide-react'
import type { ReadingPassageItem } from '../types/reading.types'
import { DataTable } from '@/shared/components/ui/data-table/data-table'
import { DataTableColumnHeader } from '@/shared/components/ui/data-table/data-table-column-header'
import { Badge } from '@/shared/components/ui/badge'

interface ExamTableProps {
  data: ReadingPassageItem[]
  loading?: boolean
}

export const ExamTable: React.FC<ExamTableProps> = ({ data, loading = false }) => {
  const columns = useMemo<ColumnDef<ReadingPassageItem>[]>(() => [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Test Title & Topic" />
      ),
      cell: ({ row }) => {
        const item = row.original
        // Clean display title
        const cleanTitle = item.title.startsWith('tiến hành dựa') 
          ? 'Custom Uploaded Exam Practice' 
          : item.title === '[Page 1]' 
          ? `Personal Test - ${item.topic}` 
          : item.title

        return (
          <div className="space-y-1 max-w-md">
            <Link
              to={`/reading/exam/${item.id}`}
              className="font-bold text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors line-clamp-1 block text-sm"
              title={cleanTitle}
            >
              {cleanTitle}
            </Link>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-600 dark:text-slate-400">{item.topic || 'Academic Topic'}</span>
              <span>•</span>
              <span>{item.totalQuestions || 13} Questions</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'sourceType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Collection Source" />
      ),
      cell: ({ row }) => {
        const src = row.getValue('sourceType') as string
        const sourceMap: Record<string, { label: string; variant: 'sky' | 'purple' | 'warning' | 'default' }> = {
          OfficialCambridge: { label: 'Cambridge Official', variant: 'sky' },
          PastActualTest: { label: 'Past Actual Test', variant: 'purple' },
          PublisherSeries: { label: 'Publisher Series', variant: 'warning' },
          UserUploaded: { label: 'Personal Vault', variant: 'default' },
          AIGenerated: { label: 'AI Adaptive Vault', variant: 'purple' },
        }

        const config = sourceMap[src] || { label: 'Personal Vault', variant: 'default' }
        return <Badge variant={config.variant}>{config.label}</Badge>
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'targetBandTier',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Target Band" />
      ),
      cell: ({ row }) => {
        const tier = row.getValue('targetBandTier') as string
        const tierLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'indigo' | 'purple' | 'success' | 'warning' | 'sky' }> = {
          PreIelts: { label: 'Pre-IELTS (0–3.5)', variant: 'success' },
          Band4_0_4_5: { label: 'Band 4.0–4.5', variant: 'secondary' },
          Band5_0_5_5: { label: 'Band 5.0–5.5', variant: 'warning' },
          Band6_0_6_5: { label: 'Band 6.0–6.5', variant: 'sky' },
          Band7_0_7_5: { label: 'Band 7.0–7.5', variant: 'indigo' },
          Band8_0_Plus: { label: 'Band 8.0–8.5+', variant: 'purple' },
        }

        const config = tierLabels[tier] || { label: 'Band 6.0–6.5', variant: 'sky' }
        return <Badge variant={config.variant}>{config.label}</Badge>
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'difficulty',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Difficulty" />
      ),
      cell: ({ row }) => {
        const diff = row.getValue('difficulty') as string
        if (diff === 'Hard') {
          return <Badge variant="destructive">Hard (Passage 3)</Badge>
        }
        if (diff === 'Medium') {
          return <Badge variant="warning">Medium (Passage 2)</Badge>
        }
        return <Badge variant="success">Easy (Passage 1)</Badge>
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'estimatedTimeMinutes',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Duration" />
      ),
      cell: ({ row }) => {
        const time = row.getValue('estimatedTimeMinutes') as number
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{time || 20} mins</span>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => {
        const item = row.original
        return (
          <Link
            to={`/reading/exam/${item.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 hover:bg-red-600 dark:bg-red-950/40 text-red-600 hover:text-white dark:text-red-400 dark:hover:text-white font-bold text-xs shadow-2xs transition-all cursor-pointer group"
          >
            <Play className="w-3 h-3 fill-current group-hover:scale-110 transition-transform" />
            <span>Start Test</span>
          </Link>
        )
      },
    },
  ], [])

  const difficultyOptions = [
    { label: 'Easy (Passage 1)', value: 'Easy' },
    { label: 'Medium (Passage 2)', value: 'Medium' },
    { label: 'Hard (Passage 3)', value: 'Hard' },
  ]

  const sourceTypeOptions = [
    { label: 'Cambridge Official', value: 'OfficialCambridge' },
    { label: 'Past Actual Test', value: 'PastActualTest' },
    { label: 'Publisher Series', value: 'PublisherSeries' },
    { label: 'Personal Vault', value: 'UserUploaded' },
    { label: 'AI Adaptive Bank', value: 'AIGenerated' },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      searchColumnKey="title"
      searchPlaceholder="Search exam title, topic, or collection..."
      difficultyOptions={difficultyOptions}
      sourceTypeOptions={sourceTypeOptions}
      loading={loading}
    />
  )
}
