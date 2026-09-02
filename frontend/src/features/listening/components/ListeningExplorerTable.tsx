import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef
} from '@tanstack/react-table';
import { 
  Play, 
  Headphones, 
  Clock, 
  HelpCircle, 
  FolderOpen
} from 'lucide-react';
import type { ListeningTest } from '../types/listening';
import { getAccentBadge, formatAudioTime } from '../utils/listeningScoring';

interface ListeningExplorerTableProps {
  data: ListeningTest[];
  isLoading?: boolean;
}

export const ListeningExplorerTable: React.FC<ListeningExplorerTableProps> = ({
  data,
  isLoading = false
}) => {
  const navigate = useNavigate();

  const columns = useMemo<ColumnDef<ListeningTest>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Test Title & Topic',
        cell: ({ row }) => {
          const test = row.original;
          return (
            <div className="flex items-start gap-3 py-1">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 mt-0.5 shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition-colors">
                  {test.title}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                  {test.topic}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                    {test.collectionName}
                  </span>
                </div>
              </div>
            </div>
          );
        }
      },
      {
        accessorKey: 'sectionNumber',
        header: 'Section / Part',
        cell: ({ row }) => {
          const test = row.original;
          const isFull = test.sectionType === 'FullTest_4Sections' || test.sectionNumber === 0;
          return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border ${
              isFull
                ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400'
                : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
            }`}>
              {isFull ? 'Full 4 Parts' : `Section ${test.sectionNumber}`}
            </span>
          );
        }
      },
      {
        accessorKey: 'accent',
        header: 'Accent',
        cell: ({ row }) => {
          const test = row.original;
          const badge = getAccentBadge(test.accent);
          return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border ${badge.bgClass} ${badge.textClass}`}>
              <span>{badge.flag}</span>
              <span>{badge.label}</span>
            </span>
          );
        }
      },
      {
        accessorKey: 'durationSeconds',
        header: 'Duration & Questions',
        cell: ({ row }) => {
          const test = row.original;
          return (
            <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>{formatAudioTime(test.durationSeconds)} mins</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                <span>{test.totalQuestions} Questions</span>
              </div>
            </div>
          );
        }
      },
      {
        accessorKey: 'difficulty',
        header: 'Difficulty',
        cell: ({ row }) => {
          const test = row.original;
          const colors = {
            Easy: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
            Medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
            Hard: 'bg-rose-500/10 text-rose-600 border-rose-500/20'
          }[test.difficulty] || 'bg-zinc-100 text-zinc-700';

          return (
            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${colors}`}>
              {test.difficulty}
            </span>
          );
        }
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const test = row.original;
          return (
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate(`/listening/exam/${test.id}`)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-red-500/20 active:scale-95 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Test</span>
              </button>
            </div>
          );
        }
      }
    ],
    [navigate]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  if (isLoading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-zinc-400 gap-3">
        <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading official IELTS Listening exams...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 mb-3">
          <FolderOpen className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">No Listening Tests Found</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mt-1">
          Try adjusting your filter options or search term to discover other Cambridge exam modules.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
      <table className="w-full text-left border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/75 dark:bg-zinc-800/40">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-red-50/30 dark:hover:bg-red-950/10 transition-colors group cursor-pointer"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3.5 align-middle">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
