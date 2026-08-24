import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { ReadingListPage } from '@/features/reading/pages/ReadingListPage'
import { ReadingExamPage } from '@/features/reading/pages/ReadingExamPage'
import { ReadingResultPage } from '@/features/reading/pages/ReadingResultPage'
import { Layout } from '@/shared/components/Layout'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'

export const router = createBrowserRouter([
  // Public Auth Routes
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />
  },

  // Protected Routes
  {
    element: <ProtectedRoute />,
    children: [
      // Standalone Fullscreen Exam View
      {
        path: '/reading/exam/:id',
        element: <ReadingExamPage />
      },

      // App Shell with Sidebar & Header
      {
        element: <Layout />,
        children: [
          {
            path: '/dashboard',
            element: <DashboardPage />
          },
          {
            path: '/reading',
            element: <ReadingListPage />
          },
          {
            path: '/reading/result/:id',
            element: <ReadingResultPage />
          },
          {
            path: '/listening',
            element: (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold">IELTS Listening Module</h2>
                <p className="text-sm text-slate-500 mt-2">Coming in Sprint 3 (Audio Streaming & Timestamp Highlighting)</p>
              </div>
            )
          },
          {
            path: '/writing',
            element: (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold">IELTS Writing AI Evaluator</h2>
                <p className="text-sm text-slate-500 mt-2">Coming in Sprint 4 (Semantic Kernel & Qdrant RAG Grading)</p>
              </div>
            )
          },
          {
            path: '/speaking',
            element: (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold">IELTS Speaking AI Examiner</h2>
                <p className="text-sm text-slate-500 mt-2">Coming in Sprint 5 (Voice Recognition & Fluency Analysis)</p>
              </div>
            )
          },
          {
            path: '/vocabulary',
            element: (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold">SuperMemo SM-2 Spaced Repetition</h2>
                <p className="text-sm text-slate-500 mt-2">Coming in Sprint 5 (Flashcards & Retention Algorithm)</p>
              </div>
            )
          },
          {
            path: '/mock-test',
            element: (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold">Full Mock Test Simulation</h2>
                <p className="text-sm text-slate-500 mt-2">Coming in Sprint 6 (180-minute Exam Simulation)</p>
              </div>
            )
          },
          {
            path: '/ai-tutor',
            element: (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold">24/7 IELTS AI Tutor</h2>
                <p className="text-sm text-slate-500 mt-2">Coming in Sprint 6 (RAG Vector Assistance)</p>
              </div>
            )
          }
        ]
      }
    ]
  },

  // Fallback redirect
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
])
