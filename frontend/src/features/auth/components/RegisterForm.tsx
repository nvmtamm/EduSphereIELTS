import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { User, Mail, Lock, Target, ArrowRight, Loader2, AlertCircle, Check } from 'lucide-react'
import axios from 'axios'

export const RegisterForm: React.FC = () => {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [targetBandScore, setTargetBandScore] = useState<number>(7.5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string[] | null>(null)

  // Password rules checker
  const isMinLength = password.length >= 8
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isMinLength || !hasUpper || !hasNumber || !hasSpecial) {
      setError(['Password must be at least 8 characters and include uppercase, number, and special character.'])
      return
    }

    setLoading(true)

    try {
      await register({
        fullName,
        email,
        password,
        targetBandScore
      })
      navigate('/dashboard')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data
        if (errorData?.errors && typeof errorData.errors === 'object') {
          const messages: string[] = []
          Object.values(errorData.errors).forEach((val) => {
            if (Array.isArray(val)) {
              messages.push(...val)
            } else if (typeof val === 'string') {
              messages.push(val)
            }
          })
          setError(messages.length > 0 ? messages : [errorData.detail || 'Validation failed.'])
        } else {
          setError([errorData?.detail || errorData?.title || 'Registration failed. Please check your information.'])
        }
      } else {
        setError(['An unexpected error occurred. Please try again.'])
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && error.length > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs space-y-1">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Please correct the following:</span>
          </div>
          <ul className="list-disc list-inside pl-1 space-y-0.5 text-[11px]">
            {error.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Full Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Full Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nguyễn Văn Minh Tâm"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@edusphere.io"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="e.g. EduSphere@2026"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Password Strength Checklist */}
        <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
          <span className={`flex items-center gap-1 ${isMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'}`}>
            <Check className={`w-3 h-3 ${isMinLength ? 'opacity-100' : 'opacity-30'}`} /> 8+ Characters
          </span>
          <span className={`flex items-center gap-1 ${hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'}`}>
            <Check className={`w-3 h-3 ${hasUpper ? 'opacity-100' : 'opacity-30'}`} /> Uppercase (A-Z)
          </span>
          <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'}`}>
            <Check className={`w-3 h-3 ${hasNumber ? 'opacity-100' : 'opacity-30'}`} /> Number (0-9)
          </span>
          <span className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'}`}>
            <Check className={`w-3 h-3 ${hasSpecial ? 'opacity-100' : 'opacity-30'}`} /> Special (@, #, !, ...)
          </span>
        </div>
      </div>

      {/* Target Band Score Picker */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-rose-500" />
            Target Band Score
          </label>
          <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-xs">
            Band {targetBandScore.toFixed(1)}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[6.0, 6.5, 7.0, 7.5, 8.0].map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => setTargetBandScore(score)}
              className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                targetBandScore === score
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 border-rose-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-rose-400'
              }`}
            >
              {score.toFixed(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Creating Account...</span>
          </>
        ) : (
          <>
            <span>Start IELTS AI Preparation</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <div className="text-center mt-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-rose-600 dark:text-rose-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </form>
  )
}
