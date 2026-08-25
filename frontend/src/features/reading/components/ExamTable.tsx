import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { Clock, Play, BookOpen, Layers } from 'lucide-react'
import type { ReadingPassageItem } from '../types/reading.types'
import { DataTable } from '@/shared/components/ui/data-table/data-table'
import { DataTableColumnHeader } from '@/shared/components/ui/data-table/data-table-column-header'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'

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
        return (
          <div className="space-y-1">
            <Link
              to={`/reading/exam/${item.id}`}
              className="font-bold text-zinc-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors line-clamp-1 block text-xs"
            >
              {item.title}
            </Link>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <span>{item.topic}</span>
              <span>•</span>
              <span className="text-zinc-500 font-medium">{item.collectionName}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'targetBandTier',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Target Band" />
      ),
      cell: ({ row }) => {
        const tier = row.getValue('targetBandTier') as string
        const tierLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'indigo' | 'purple' | 'success' | 'warning' }> = {
          PreIelts: { label: 'Pre-IELTS (0–3.5)', variant: 'success' },
          Band4_0_4_5: { label: 'Band 4.0–4.5', variant: 'secondary' },
          Band5_0_5_5: { label: 'Band 5.0–5.5', variant: 'warning' },
          Band6_0_6_5: { label: 'Band 6.0–6.5', variant: 'default' },
          Band7_0_7_5: { label: 'Band 7.0–7.5', variant: 'indigo' },
          Band8_0_Plus: { label: 'Band 8.0–8.5+', variant: 'purple' },
        }

        const config = tierLabels[tier] || { label: tier, variant: 'default' }
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
          return <Badge variant="default">Medium (Passage 2)</Badge>
        }
        return <Badge variant="success">Easy (Passage 1)</Badge>
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'sourceType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Source Vault" />
      ),
      cell: ({ row }) => {
        const src = row.getValue('sourceType') as string
        return (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
            {src}
          </span>
        )
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
          <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>{time} mins</span>
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
          <Button asChild size="sm" variant="red">
            <Link to={`/reading/exam/${item.id}`} className="flex items-center gap-1.5 font-bold text-xs">
              <Play className="w-3 h-3 fill-current" />
              <span>Start</span>
            </Link>
          </Button>
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
    { label: 'User Uploaded', value: 'UserUploaded' },
    { label: 'AI Generated', value: 'AIGenerated' },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      searchColumnKey="title"
      searchPlaceholder="Search exams, topics, or collections..."
      difficultyOptions={difficultyOptions}
      sourceTypeOptions={sourceTypeOptions}
      loading={loading}
    />
  )
}
