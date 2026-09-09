import React from 'react'

interface AdminStatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: string
  trendPositive?: boolean
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true
}) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
          {title}
        </span>
        <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-zinc-500 mt-1">{subtitle}</div>
        )}
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-1.5 text-xs">
          <span
            className={`font-bold ${
              trendPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {trend}
          </span>
          <span className="text-zinc-400">vs last month</span>
        </div>
      )}
    </div>
  )
}
