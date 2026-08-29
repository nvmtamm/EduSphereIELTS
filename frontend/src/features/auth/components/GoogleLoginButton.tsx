import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { useAuth } from '@/shared/hooks/useAuth'
import { useTheme } from '@/shared/context/ThemeContext'
import { Loader2, AlertCircle, Sparkles, UserCheck } from 'lucide-react'
import axios from 'axios'

interface GoogleLoginButtonProps {
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  text = 'signin_with'
}) => {
  const { loginWithGoogle } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDemoOption, setShowDemoOption] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const [btnWidth, setBtnWidth] = useState<string>('384')

  useEffect(() => {
    if (!containerRef.current) return

    const updateWidth = () => {
      if (containerRef.current) {
        // Google GIS allows width between 200 and 400 pixels
        const width = Math.min(Math.max(containerRef.current.clientWidth, 200), 400)
        setBtnWidth(Math.floor(width).toString())
      }
    }

    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [])

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google Sign-In did not return an authentication token.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await loginWithGoogle(credentialResponse.credential)
      navigate('/dashboard')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data
        setError(errorData?.detail || errorData?.title || 'Failed to authenticate with Google.')
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleError = () => {
    setError('Google Sign-In popup was closed or origin is not whitelisted in Google Cloud Console. Ensure http://localhost:5173 is added to Authorized JavaScript Origins.')
    setShowDemoOption(true)
  }

  const handleDemoGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      await loginWithGoogle('demo-google-token')
      navigate('/dashboard')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Failed to authenticate demo Google account.')
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={containerRef} className="w-full space-y-2.5">
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs space-y-2">
          <div className="flex items-start gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
          {showDemoOption && (
            <button
              type="button"
              onClick={handleDemoGoogleLogin}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Use Simulated Google Account (1-Click)</span>
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 dark:border-zinc-700">
          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
          <span>Authenticating with Google...</span>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="w-full flex items-center justify-center overflow-hidden rounded-xl">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap={false}
              theme={theme === 'dark' ? 'filled_black' : 'outline'}
              size="large"
              shape="rectangular"
              text={text}
              width={btnWidth}
              logo_alignment="center"
            />
          </div>

          {/* Quick Demo Google Login Pill for Instant Testing */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleDemoGoogleLogin}
              className="text-[11px] font-semibold text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 inline-flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Sign in with Demo Google Candidate</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
