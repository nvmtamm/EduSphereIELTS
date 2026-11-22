import React from 'react'

export type Tone = 'neutral' | 'info' | 'success' | 'warn' | 'danger'

const badgeTone: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  warn: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  danger: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
}

/** Small status label: soft tint background, coloured text, no border. */
export const StatusBadge: React.FC<{ tone?: Tone; children: React.ReactNode }> = ({ tone = 'neutral', children }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeTone[tone]}`}>{children}</span>
)

const bannerTone: Record<Exclude<Tone, 'neutral'>, string> = {
  info: 'bg-blue-50 border-blue-600 dark:bg-blue-950/30',
  success: 'bg-emerald-50 border-emerald-600 dark:bg-emerald-950/30',
  warn: 'bg-amber-50 border-amber-500 dark:bg-amber-950/30',
  danger: 'bg-red-50 border-red-600 dark:bg-red-950/30'
}

/** Message strip with a 3px left accent in the same hue. */
export const Banner: React.FC<{ tone?: Exclude<Tone, 'neutral'>; children: React.ReactNode; action?: React.ReactNode }> = ({
  tone = 'info',
  children,
  action
}) => (
  <div className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border-l-4 px-5 py-4 ${bannerTone[tone]}`}>
    <div className="text-sm text-slate-800 dark:text-slate-100">{children}</div>
    {action}
  </div>
)

/** Square icon holder: neutral (default) or red tint. */
export const IconTile: React.FC<{ tone?: 'neutral' | 'red'; children: React.ReactNode; size?: 'md' | 'lg' }> = ({
  tone = 'neutral',
  children,
  size = 'md'
}) => (
  <div
    className={`${size === 'lg' ? 'w-12 h-12' : 'w-11 h-11'} rounded-xl flex items-center justify-center ${
      tone === 'red'
        ? 'bg-red-50 text-red-600 dark:bg-red-950/40'
        : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
    }`}
  >
    {children}
  </div>
)

export const difficultyTone = (d?: string): Tone => (d === 'Hard' ? 'danger' : d === 'Medium' ? 'warn' : d === 'Easy' ? 'success' : 'neutral')
