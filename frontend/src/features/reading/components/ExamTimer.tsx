import React, { useEffect, useState } from 'react'
import { Clock, Pause, Play, AlertTriangle } from 'lucide-react'

interface ExamTimerProps {
  initialSeconds: number
  onTimeUp: () => void
  onTick?: (secondsLeft: number) => void
}

export const ExamTimer: React.FC<ExamTimerProps> = ({ initialSeconds, onTimeUp, onTick }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return

    if (secondsLeft <= 0) {
      onTimeUp()
      return
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1
        onTick?.(next)
        if (next <= 0) {
          clearInterval(interval)
          onTimeUp()
          return 0
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [secondsLeft, isPaused, onTimeUp, onTick])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const isLowTime = secondsLeft <= 300 // 5 minutes

  return (
    <div className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border transition-all ${
      isLowTime
        ? 'bg-red-950/80 border-red-600 text-red-500 animate-pulse font-bold'
        : 'bg-zinc-900 border-zinc-800 text-white'
    }`}>
      {isLowTime ? (
        <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
      ) : (
        <Clock className="w-4 h-4 text-red-600" />
      )}
      <span className="font-mono font-bold text-sm tracking-wider">{formattedTime}</span>
      <button
        type="button"
        onClick={() => setIsPaused(!isPaused)}
        title={isPaused ? 'Resume timer' : 'Pause timer'}
        className="p-1 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white cursor-pointer"
      >
        {isPaused ? <Play className="w-3.5 h-3.5 text-white" /> : <Pause className="w-3.5 h-3.5 text-zinc-400" />}
      </button>
    </div>
  )
}
