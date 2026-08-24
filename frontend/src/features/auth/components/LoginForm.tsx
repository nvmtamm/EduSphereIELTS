import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { GoogleLoginButton } from './GoogleLoginButton'
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, KeyRound } from 'lucide-react'
import axios from 'axios'

export const LoginForm: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLoginFailed, setHasLoginFailed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login({ email: email.trim(), password })
      navigate('/dashboard')
    } catch (err: unknown) {
      setHasLoginFailed(true)
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data
        if (errorData?.errors && typeof errorData.errors === 'object') {
          const messages: string[] = []
          Object.values(errorData.errors).forEach((val) => {
            if (Array.isArray(val)) messages.push(...val)
            else if (typeof val === 'string') messages.push(val)
          })
          setError(messages.join('. ') || errorData.detail || 'Validation failed.')
        } else {
          setError(errorData?.detail || errorData?.title || 'Invalid email or password.')
        }
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Banner with contextual Forgot Password prompt */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <div className="pt-1 border-t border-rose-200/60 dark:border-rose-800/60 flex items-center justify-between text-[11px]">
              <span>Forgot your credentials?</span>
              <Link
                to="/forgot-password"
                className="font-bold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3" />
                <span>Reset password</span>
              </Link>
            </div>
          </div>
        )}

        {/* Email Input */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@edusphere.io"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            {/* Show Forgot Password link ONLY when login attempt has failed */}
            {hasLoginFailed && (
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-red-600 hover:text-red-500 dark:text-red-400 transition-colors inline-flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3" />
                <span>Forgot password?</span>
              </Link>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-sm shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In to EduSphere</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
        <span className="bg-white dark:bg-zinc-900 px-3 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider absolute">
          Or continue with
        </span>
      </div>

      {/* Google OAuth Login Button (at the bottom) */}
      <GoogleLoginButton text="signin_with" />

      {/* Registration Link */}
      <div className="text-center pt-2">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-red-600 dark:text-red-400 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
