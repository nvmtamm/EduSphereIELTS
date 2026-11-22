import React, { useState } from 'react'
import type { AdminUserListItem } from '../types/admin.types'
import { ShieldAlert, Check, X, Loader2 } from 'lucide-react'

interface UserRoleChangeModalProps {
  user: AdminUserListItem
  isOpen: boolean
  onClose: () => void
  onConfirm: (userId: string, newRole: 'Student' | 'Admin') => Promise<void>
}

export const UserRoleChangeModal: React.FC<UserRoleChangeModalProps> = ({
  user,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [loading, setLoading] = useState(false)
  const targetRole = user.role === 'Admin' ? 'Student' : 'Admin'

  if (!isOpen) return null

  const handleExecute = async () => {
    setLoading(true)
    try {
      await onConfirm(user.id, targetRole)
      onClose()
    } catch (err) {
      alert('Failed to update user role. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-zinc-950 dark:text-white">
              Confirm Role Change
            </h3>
            <p className="text-xs text-zinc-500">Security privilege modification</p>
          </div>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Are you sure you want to change <strong>{user.fullName}</strong> ({user.email}) from{' '}
          <span className="font-bold text-zinc-900 dark:text-white">{user.role}</span> to{' '}
          <span className="font-bold text-red-600">{targetRole}</span>?
          {targetRole === 'Admin' && (
            <span className="block mt-2 text-xs text-amber-600 dark:text-amber-400">
              Warning: Granting Admin privileges grants full access to user data, exam banks, and system configurations.
            </span>
          )}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExecute}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-red-600/30 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>Confirm {targetRole}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
