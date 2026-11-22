import React, { useState } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import type { AdminUserListItem } from '../types/admin.types'
import {
  ShieldCheck,
  GraduationCap,
  MoreHorizontal,
  Lock,
  Unlock,
  UserCheck,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface UserManagementTableProps {
  users: AdminUserListItem[]
  totalCount: number
  pageNumber: number
  pageSize: number
  onPageChange: (newPage: number) => void
  onRoleChangeClick: (user: AdminUserListItem) => void
  onToggleStatus: (userId: string, currentStatus: boolean) => Promise<void>
  onSearchChange: (search: string) => void
  onRoleFilterChange: (role?: 'Student' | 'Admin') => void
}

const columnHelper = createColumnHelper<AdminUserListItem>()

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  totalCount,
  pageNumber,
  pageSize,
  onPageChange,
  onRoleChangeClick,
  onToggleStatus,
  onSearchChange,
  onRoleFilterChange
}) => {
  const [searchInput, setSearchInput] = useState('')
  const [roleFilter, setRoleFilter] = useState<'All' | 'Student' | 'Admin'>('All')

  const totalPages = Math.ceil(totalCount / pageSize) || 1

  const columns = [
    columnHelper.accessor('fullName', {
      header: 'Learner / User',
      cell: (info) => {
        const user = info.row.original
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-600/10 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center shrink-0">
              {user.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-zinc-900 dark:text-white text-xs">
                {user.fullName}
              </div>
              <div className="text-[11px] text-zinc-400 font-mono">{user.email}</div>
            </div>
          </div>
        )
      }
    }),

    columnHelper.accessor('role', {
      header: 'Security Role',
      cell: (info) => {
        const role = info.getValue()
        const isAdmin = role === 'Admin'
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              isAdmin
                ? 'bg-red-600/10 text-red-600 dark:text-red-400 border border-red-600/20'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            {isAdmin ? <ShieldCheck className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
            <span>{role}</span>
          </span>
        )
      }
    }),

    columnHelper.accessor('isActive', {
      header: 'Account Status',
      cell: (info) => {
        const isActive = info.getValue()
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              isActive
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
            <span>{isActive ? 'Active' : 'Locked'}</span>
          </span>
        )
      }
    }),

    columnHelper.accessor('targetBandScore', {
      header: 'Target Band',
      cell: (info) => {
        const val = info.getValue()
        return (
          <span className="font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {val ? `Band ${val.toFixed(1)}` : '—'}
          </span>
        )
      }
    }),

    columnHelper.accessor('totalSubmissions', {
      header: 'Submissions',
      cell: (info) => (
        <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">
          {info.getValue()} exams
        </span>
      )
    }),

    columnHelper.accessor('createdAt', {
      header: 'Joined Date',
      cell: (info) => (
        <span className="text-xs text-zinc-500">
          {new Date(info.getValue()).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </span>
      )
    }),

    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const user = info.row.original
        return (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onRoleChangeClick(user)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
              title="Change Role"
            >
              {user.role === 'Admin' ? 'Demote' : 'Promote'}
            </button>
            <button
              type="button"
              onClick={() => onToggleStatus(user.id, user.isActive)}
              className={`p-1 rounded-lg transition-colors ${
                user.isActive
                  ? 'text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40'
                  : 'text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
              title={user.isActive ? 'Lock Account' : 'Unlock Account'}
            >
              {user.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
          </div>
        )
      }
    })
  ]

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <div className="space-y-4">
      {/* Table Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              onSearchChange(e.target.value)
            }}
            placeholder="Search by full name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-zinc-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl w-full sm:w-auto">
          {(['All', 'Student', 'Admin'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRoleFilter(r)
                onRoleFilterChange(r === 'All' ? undefined : r)
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                roleFilter === r
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-5 py-3.5">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-12 text-center text-zinc-400">
                    No learners found matching the search criteria.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 py-3.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-950/80 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <span>
            Showing {users.length} of {totalCount} learners
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(pageNumber - 1)}
              disabled={pageNumber <= 1}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              Page {pageNumber} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(pageNumber + 1)}
              disabled={pageNumber >= totalPages}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
