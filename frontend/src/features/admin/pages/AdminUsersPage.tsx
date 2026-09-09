import React, { useState, useEffect, useCallback } from 'react'
import { adminApi, type UserQueryParams } from '../api/adminApi'
import type { AdminUserListItem } from '../types/admin.types'
import { UserManagementTable } from '../components/UserManagementTable'
import { UserRoleChangeModal } from '../components/UserRoleChangeModal'
import { Users, ShieldCheck, UserCheck, UserX, Loader2 } from 'lucide-react'

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserListItem[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize] = useState<number>(10)
  const [search, setSearch] = useState<string>('')
  const [roleFilter, setRoleFilter] = useState<'Student' | 'Admin' | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedUserForRole, setSelectedUserForRole] = useState<AdminUserListItem | null>(null)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: UserQueryParams = {
        pageNumber,
        pageSize,
        search: search.trim() || undefined,
        role: roleFilter
      }
      const data = await adminApi.getUsers(params)
      setUsers(data.items)
      setTotalCount(data.totalCount)
    } catch (err) {
      console.error('Failed to load users list:', err)
    } finally {
      setIsLoading(false)
    }
  }, [pageNumber, pageSize, search, roleFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage)
  }

  const handleSearchChange = (query: string) => {
    setSearch(query)
    setPageNumber(1)
  }

  const handleRoleFilterChange = (role?: 'Student' | 'Admin') => {
    setRoleFilter(role)
    setPageNumber(1)
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await adminApi.toggleUserStatus(userId, !currentStatus)
      await fetchUsers()
    } catch (err) {
      console.error('Failed to toggle status:', err)
      alert('Unable to toggle user account status.')
    }
  }

  const handleRoleConfirm = async (userId: string, newRole: 'Student' | 'Admin') => {
    await adminApi.updateUserRole(userId, newRole)
    await fetchUsers()
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-600/10 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
                User Management
              </h1>
              <p className="text-xs text-zinc-500 font-medium">
                Administer learner accounts, assign security roles, and enforce access policies.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-red-600" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
        </div>
      </div>

      {/* Main Table or Loading state */}
      {isLoading && users.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          <p className="text-xs text-zinc-400 font-medium tracking-wide">
            Retrieving candidate records...
          </p>
        </div>
      ) : (
        <UserManagementTable
          users={users}
          totalCount={totalCount}
          pageNumber={pageNumber}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onRoleChangeClick={(u) => setSelectedUserForRole(u)}
          onToggleStatus={handleToggleStatus}
          onSearchChange={handleSearchChange}
          onRoleFilterChange={handleRoleFilterChange}
        />
      )}

      {/* Role Change Modal */}
      {selectedUserForRole && (
        <UserRoleChangeModal
          user={selectedUserForRole}
          isOpen={!!selectedUserForRole}
          onClose={() => setSelectedUserForRole(null)}
          onConfirm={handleRoleConfirm}
        />
      )}
    </div>
  )
}
