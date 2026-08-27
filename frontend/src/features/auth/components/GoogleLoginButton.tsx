import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { useAuth } from '@/shared/hooks/useAuth'
import { useTheme } from '@/shared/context/ThemeContext'
import { Loader2, AlertCircle } from 'lucide-react'
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
    setError('Google Sign-In was cancelled or failed. Please ensure your Google account is configured.')
  }

  return (
    <div ref={containerRef} className="w-full space-y-2.5">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 dark:border-zinc-700">
          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
          <span>Authenticating with Google...</span>
        </div>
      ) : (
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
      )}
    </div>
  )
}
