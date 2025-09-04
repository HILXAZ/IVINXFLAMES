import React, { useEffect, useState, lazy, Suspense, startTransition } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
const Login = lazy(() => import('./pages/Login'))
const Landing = lazy(() => import('./pages/Landing'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
import Tracker from './pages/Tracker'
const Tips = lazy(() => import('./pages/Tips'))
const Library = lazy(() => import('./pages/Library'))
const Emergency = lazy(() => import('./pages/Emergency'))
const Community = lazy(() => import('./pages/Community'))
const Profile = lazy(() => import('./pages/Profile'))
const Assistant = lazy(() => import('./pages/Assistant'))
const DinoGame = lazy(() => import('./pages/DinoGame'))
const Resources = lazy(() => import('./pages/Resources'))
const ScriptAnalyzer = lazy(() => import('./pages/ScriptAnalyzer'))
const Jokes = lazy(() => import('./pages/Jokes'))
const DatabaseTest = lazy(() => import('./pages/DatabaseTest'))
const TypingTest = lazy(() => import('./pages/TypingTest'))
// Lazy-load heavy pages to reduce initial bundle
const Breathing = lazy(() => import('./pages/Breathing'))
const MentorDemo = lazy(() => import('./pages/MentorDemo'))
const VoiceMentor = lazy(() => import('./pages/VoiceMentor'))
const Exercise = lazy(() => import('./pages/Exercise'))
const MassiveExercise = lazy(() => import('./pages/MassiveExercise'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
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
      startTransition(() => {
        setSession(session)
        setLoading(false)
      })
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      startTransition(() => {
        setSession(session)
        setLoading(false)
      })
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
                    <Route path="/" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><Dashboard /></Suspense>} />
                    <Route path="/dashboard" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><Dashboard /></Suspense>} />
                    <Route path="/dashbord" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><Dashboard /></Suspense>} />
                    <Route path="/assistant" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><Assistant /></Suspense>} />
                    <Route path="/script-analyzer" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><ScriptAnalyzer /></Suspense>} />
                    <Route path="/jokes" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><Jokes /></Suspense>} />
                    <Route path="/typing-test" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><TypingTest /></Suspense>} />
                    <Route path="/database-test" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><DatabaseTest /></Suspense>} />
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
                    <Route path="/tips" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><Tips /></Suspense>} />
                    <Route path="/library" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><Library /></Suspense>} />
                    <Route path="/diary" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><DinoGame /></Suspense>} />
                    <Route path="/resources" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><Resources /></Suspense>} />
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
                    <Route path="/emergency" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><Emergency /></Suspense>} />
                    <Route path="/community" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><Community /></Suspense>} />
                    { /* Coach page removed; use Assistant instead */ }
                    { /* RapidCoach removed */ }
                    <Route path="/profile" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><Profile /></Suspense>} />
                    <Route path="/auth/callback" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><AuthCallback /></Suspense>} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
              </>
            ) : (
              <Routes>
                <Route path="/" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><Landing /></Suspense>} />
                <Route path="/landing.html" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><Landing /></Suspense>} />
                {/* Login routes and any nested paths under /login */}
                <Route path="/login" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><Login /></Suspense>} />
                <Route path="/login/*" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><Login /></Suspense>} />
                {/* Common mistype alias */}
                <Route path="/loginpage" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><Login /></Suspense>} />
                {/* Explicit deep-link aliases */}
                <Route path="/login/community" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><Login /></Suspense>} />
                
                    <Route path="/assistant" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><Assistant /></Suspense>} />
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
                <Route path="/auth/callback" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><AuthCallback /></Suspense>} />
                <Route path="/diary" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><DinoGame /></Suspense>} />
                <Route path="/emergency" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><Emergency /></Suspense>} />
                <Route path="/resources" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><Resources /></Suspense>} />
                <Route path="/jokes" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><Jokes /></Suspense>} />
                <Route path="/database-test" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><DatabaseTest /></Suspense>} />
                <Route path="/script-analyzer" element={<Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}><ScriptAnalyzer /></Suspense>} />
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
