import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import type { ReadingPassageItem } from '../types/reading.types'
import { DataTable } from '@/shared/components/ui/data-table/data-table'
import { DataTableColumnHeader } from '@/shared/components/ui/data-table/data-table-column-header'
import { StatusBadge, difficultyTone } from '@/shared/components/Feedback'

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
              className="font-semibold text-slate-900 dark:text-white hover:text-red-600 transition-colors line-clamp-1 block text-sm"
              title={cleanTitle}
            >
              {cleanTitle}
            </Link>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{item.topic || 'Academic Topic'}</span>
              <span>·</span>
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
        const sourceMap: Record<string, string> = {
          OfficialCambridge: 'Cambridge Official',
          PastActualTest: 'Past Actual Test',
          PublisherSeries: 'Publisher Series',
          UserUploaded: 'Personal Vault',
          AIGenerated: 'AI Adaptive Bank',
        }
        return <span className="text-sm text-slate-600 dark:text-slate-300">{sourceMap[src] || 'Personal Vault'}</span>
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
        const tierLabels: Record<string, string> = {
          PreIelts: 'Pre-IELTS (0–3.5)',
          Band4_0_4_5: 'Band 4.0–4.5',
          Band5_0_5_5: 'Band 5.0–5.5',
          Band6_0_6_5: 'Band 6.0–6.5',
          Band7_0_7_5: 'Band 7.0–7.5',
          Band8_0_Plus: 'Band 8.0–8.5+',
        }
        return <span className="text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">{tierLabels[tier] || 'Band 6.0–6.5'}</span>
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
        return <StatusBadge tone={difficultyTone(diff)}>{diff}</StatusBadge>
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
          <span className="text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">{time || 20} min</span>
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
            className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold whitespace-nowrap"
          >
            Start
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
      hideToolbar
    />
  )
}
