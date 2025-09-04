import React, { useEffect, useState, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import Login from './pages/Login'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Tracker from './pages/Tracker'
import Tips from './pages/Tips'
import Library from './pages/Library'
import Emergency from './pages/Emergency'
import Community from './pages/Community'
import Profile from './pages/Profile'
import Assistant from './pages/Assistant'
import DinoGame from './pages/DinoGame'
import Resources from './pages/Resources'
import ScriptAnalyzer from './pages/ScriptAnalyzer'
import Jokes from './pages/Jokes'
import DatabaseTest from './pages/DatabaseTest'
import TypingTest from './pages/TypingTest'
// Lazy-load heavy pages to reduce initial bundle
const Breathing = lazy(() => import('./pages/Breathing'))
const MentorDemo = lazy(() => import('./pages/MentorDemo'))
const VoiceMentor = lazy(() => import('./pages/VoiceMentor'))
const Exercise = lazy(() => import('./pages/Exercise'))
const MassiveExercise = lazy(() => import('./pages/MassiveExercise'))
import AuthCallback from './pages/AuthCallback'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './components/Toast'
import LoadingSpinner from './components/LoadingSpinner'
import DebugPanel from './components/DebugPanel'
import { registerSW, requestNotificationPermission } from './utils/pwa'
import analytics from './utils/analytics'

function App() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    // Initialize PWA features
    registerSW()
    
    // Request notification permission after user interaction
    const requestPermission = () => {
      requestNotificationPermission()
      document.removeEventListener('click', requestPermission)
    }
    document.addEventListener('click', requestPermission, { once: true })

    // Track app initialization
    analytics.track('app_initialized', {
      has_session: !!session,
      timestamp: new Date().toISOString()
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            {session ? (
              <>
                <Navbar />
                <main className="pb-16 md:pb-0">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashbord" element={<Dashboard />} />
                    <Route path="/assistant" element={<Assistant />} />
                    <Route path="/script-analyzer" element={<ScriptAnalyzer />} />
                    <Route path="/jokes" element={<Jokes />} />
                    <Route path="/typing-test" element={<TypingTest />} />
                    <Route path="/database-test" element={<DatabaseTest />} />
                    <Route
                      path="/breathing"
                      element={
                        <Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}>
                          <Breathing />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/exercise"
                      element={
                        <Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}>
                          <Exercise />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/mentor"
                      element={
                        <Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}>
                          <MentorDemo />
                        </Suspense>
                      }
                    />
                    
                    <Route
                      path="/voice"
                      element={
                        <Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}>
                          <VoiceMentor />
                        </Suspense>
                      }
                    />
                    <Route path="/tracker" element={<Tracker />} />
                    <Route path="/tips" element={<Tips />} />
                    <Route path="/library" element={<Library />} />
                    <Route path="/diary" element={<DinoGame />} />
                    <Route path="/resources" element={<Resources />} />
                    <Route
                      path="/exercise/massive"
                      element={
                        <Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}>
                          <MassiveExercise />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/videos"
                      element={
                        <Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}>
                          <MassiveExercise />
                        </Suspense>
                      }
                    />
                    <Route path="/emergency" element={<Emergency />} />
                    <Route path="/community" element={<Community />} />
                    { /* Coach page removed; use Assistant instead */ }
                    { /* RapidCoach removed */ }
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
              </>
            ) : (
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/landing.html" element={<Landing />} />
                {/* Login routes and any nested paths under /login */}
                <Route path="/login" element={<Login />} />
                <Route path="/login/*" element={<Login />} />
                {/* Common mistype alias */}
                <Route path="/loginpage" element={<Login />} />
                {/* Explicit deep-link aliases */}
                <Route path="/login/community" element={<Login />} />
                
                <Route path="/assistant" element={<Assistant />} />
                <Route
                  path="/breathing"
                  element={
                    <Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}>
                      <Breathing />
                    </Suspense>
                  }
                />
                <Route
                  path="/exercise"
                  element={
                    <Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}>
                      <Exercise />
                    </Suspense>
                  }
                />
                <Route
                  path="/exercise/massive"
                  element={
                    <Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}>
                      <MassiveExercise />
                    </Suspense>
                  }
                />
                <Route
                  path="/videos"
                  element={
                    <Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}>
                      <MassiveExercise />
                    </Suspense>
                  }
                />
                <Route
                  path="/mentor"
                  element={
                    <Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}>
                      <MentorDemo />
                    </Suspense>
                  }
                />
                
                <Route
                  path="/voice"
                  element={
                    <Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}>
                      <VoiceMentor />
                    </Suspense>
                  }
                />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/diary" element={<DinoGame />} />
                <Route path="/emergency" element={<Emergency />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/jokes" element={<Jokes />} />
                <Route path="/database-test" element={<DatabaseTest />} />
                <Route path="/script-analyzer" element={<ScriptAnalyzer />} />
                { /* Coach page removed; use Assistant instead */ }
                { /* RapidCoach removed */ }
                {/* Catch-all back to landing */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            )}
            <DebugPanel />
          </div>
        </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
