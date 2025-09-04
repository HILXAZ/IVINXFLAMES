import { useState, useEffect, startTransition } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/supabase'
import { streakUtils, statsUtils, dateUtils } from '../lib/utils'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { 
  Target, TrendingUp, Calendar, Award, Plus, CheckCircle, AlertTriangle, Heart, Zap,
  Smile, Gamepad2, Wind, MessageCircle, Users, Activity, Brain, Sparkles, 
  Compass, Book, Coffee, Moon, Sun, CloudRain, Volume2, Headphones
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import LapseRescueMode from '../components/LapseRescueMode'
import AnimatedBackground from '../components/AnimatedBackground'
import OppenheimerBackground from '../components/OppenheimerBackground'
import WonderButton, { ActionButton, HeartButton, MagicButton } from '../components/WonderButton'
import WeatherAssistant from '../components/WeatherAssistant'
import WeatherMini from '../components/WeatherMini'
import WeatherForecast from '../components/WeatherForecast'
import TimeWidget from '../components/TimeWidget'
import QuickStatsWidget from '../components/QuickStatsWidget'
import ActivitySuggestions from '../components/ActivitySuggestions'
import SimpleTimeWidget from '../components/SimpleTimeWidget'
import SupportMap from '../components/SupportMap'
import GlassmorphismCard from '../components/GlassmorphismCard'

const Dashboard = () => {
  const { user } = useAuth()
  const [habits, setHabits] = useState([])
  const [habitLogs, setHabitLogs] = useState([])
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedHabit, setSelectedHabit] = useState(null)
  const [showLapseRescue, setShowLapseRescue] = useState(false)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('modern') // 'modern' | 'classic'
  const [showSupportMap, setShowSupportMap] = useState(false)

  // Persist mode across sessions
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dashboardMode')
      if (saved === 'modern' || saved === 'classic') setMode(saved)
    } catch (_) {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem('dashboardMode', mode) } catch (_) {}
  }, [mode])

  useEffect(() => {
    if (user) {
      startTransition(() => {
        loadDashboardData()
      })
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      startTransition(() => {
        setError(null)
      })
      const [habitsData, badgesData] = await Promise.all([
        db.getHabits(user.id),
        db.getUserBadges(user.id)
      ])

      startTransition(() => {
        setHabits(habitsData || [])
        setBadges(badgesData || [])
      })

      if (habitsData && habitsData.length > 0) {
        const primaryHabit = habitsData[0]
        startTransition(() => {
          setSelectedHabit(primaryHabit)
        })
        
        const logs = await db.getHabitLogs(primaryHabit.id)
        startTransition(() => {
          setHabitLogs(logs || [])
        })
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      startTransition(() => {
        setError('Failed to load dashboard data. Please check your connection and try again.')
      })
    } finally {
      startTransition(() => {
        setLoading(false)
      })
    }
  }

  const handleHabitSelect = async (habit) => {
    startTransition(() => {
      setSelectedHabit(habit)
    })
    try {
      const logs = await db.getHabitLogs(habit.id)
      startTransition(() => {
        setHabitLogs(logs || [])
      })
    } catch (error) {
      console.error('Error loading habit logs:', error)
    }
  }

  const logToday = async (value = 1) => {
    if (!selectedHabit) return

    try {
      await db.logHabit({
        habit_id: selectedHabit.id,
        date: dateUtils.today(),
        value: value,
        note: ''
      })
      
      // Reload logs
      const logs = await db.getHabitLogs(selectedHabit.id)
      startTransition(() => {
        setHabitLogs(logs || [])
      })
    } catch (error) {
      console.error('Error logging habit:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Dashboard Error</h3>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => {
              startTransition(() => {
                setError(null)
                setLoading(true)
              })
              loadDashboardData()
            }}
            className="btn-primary"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No habits tracked yet</h3>
          <p className="text-white/70 mb-6">Start your journey by creating your first habit tracker.</p>
          <a
            href="/tracker"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Habit</span>
          </a>
        </motion.div>
      </div>
    )
  }

  const currentStreak = selectedHabit ? streakUtils.calculateStreak(habitLogs) : 0
  const longestStreak = selectedHabit ? streakUtils.getLongestStreak(habitLogs) : 0
  const successRate = selectedHabit ? statsUtils.getSuccessRate(habitLogs) : 0
  const weeklyData = selectedHabit ? statsUtils.getWeeklyStats(habitLogs) : []
  const totalDays = habitLogs.filter(log => log.value > 0).length

  const todayLog = habitLogs.find(log => log.date === dateUtils.today())
  const isLoggedToday = todayLog && todayLog.value > 0

  return (
    <OppenheimerBackground>
      <div className="max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 xl:p-8 pb-20 md:pb-8">
        {/* Welcome Header - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 bg-white/15 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                Welcome back! 🌟 [ENHANCED v2.0]
              </h1>
              <p className="text-white/90 text-sm sm:text-base lg:text-lg">
                Here's your amazing progress overview with new weather features!
              </p>
            </div>
            {/* Mode toggle */}
            <div className="inline-flex self-start md:self-auto bg-white/20 backdrop-blur rounded-lg p-1 border border-white/30 shadow-sm">
              <button
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${mode === 'modern' ? 'bg-emerald-500 text-white shadow' : 'text-white/90 hover:bg-white/20'}`}
                onClick={() => setMode('modern')}
              >
                Modern
              </button>
              <button
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${mode === 'classic' ? 'bg-emerald-500 text-white shadow' : 'text-white/90 hover:bg-white/20'}`}
                onClick={() => setMode('classic')}
              >
                Classic
              </button>
            </div>
          </div>
        </motion.div>

        {/* TEST: New Enhanced Components - Modern Mode */}
        {mode === 'modern' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-2xl p-6"
        >
          <h2 className="text-white text-2xl font-bold mb-4 flex items-center">
            🌤️ Enhanced Weather Dashboard - ACTIVE!
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <h3 className="text-white font-semibold mb-2">Weather Forecast</h3>
              <p className="text-white/70 text-sm">5-day detailed forecast</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <h3 className="text-white font-semibold mb-2">Time Widget</h3>
              <p className="text-white/70 text-sm">Real-time progress tracking</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <h3 className="text-white font-semibold mb-2">Quick Stats</h3>
              <p className="text-white/70 text-sm">Recovery metrics</p>
            </div>
          </div>
        </motion.div>
        )}

        {/* WEATHER FEATURES SECTION - Dedicated Section */}
        {mode === 'modern' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 sm:mb-8"
        >
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-2xl p-6 mb-6">
            <h2 className="text-white text-xl font-bold mb-4 flex items-center">
              🌦️ Weather & Environmental Support
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WeatherForecast />
              <ActivitySuggestions />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TimeWidget />
            <QuickStatsWidget />
          </div>
        </motion.div>
        )}

        {/* Quick strip: Weather + key stats + Support Map */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2"
        >
          <WeatherMini />
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 px-3 py-2 shadow-sm text-xs text-white/90">
            <TrendingUp className="h-4 w-4 text-cyan-400" />
            <span><strong>{currentStreak}</strong> day streak</span>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 px-3 py-2 shadow-sm text-xs text-white/90">
            <Award className="h-4 w-4 text-emerald-400" />
            <span>Best <strong>{longestStreak}</strong></span>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 px-3 py-2 shadow-sm text-xs text-white/90">
            <Target className="h-4 w-4 text-purple-400" />
            <span><strong>{totalDays}</strong> total</span>
          </div>
          <button
            onClick={() => setShowSupportMap(true)}
            className="ml-auto sm:ml-0 px-3 py-2 rounded-xl border border-blue-300/40 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-xs shadow-sm"
            title="Find nearby support"
          >
            <Users className="inline-block h-4 w-4 mr-1 align-text-bottom" />
            Support map
          </button>
        </motion.div>

        {/* Weather Assistant - shown in modern mode */}
        {mode === 'modern' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <WeatherAssistant />
        </motion.div>
        )}

        {/* Classic Mode panel */}
        {mode === 'classic' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <GlassmorphismCard variant="hero" intensity="strong" className="p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                ☀️ Classic Dashboard
              </h2>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80">
                <Sun className="w-4 h-4" />
                <span>{new Date().toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {/* Weather + suggestion */}
              <div className="lg:col-span-2">
                <WeatherAssistant />
              </div>

              {/* Classic quick tiles */}
              <div className="grid grid-cols-2 gap-3">
                <a href="/breathing" className="p-3 rounded-xl border bg-white/15 border-white/20 hover:bg-white/25 transition-all flex items-center gap-3">
                  <Wind className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-sm font-semibold text-white">Breathing</div>
                    <div className="text-xs text-white/70">Calm in 60s</div>
                  </div>
                </a>
                <a href="/tips" className="p-3 rounded-xl border bg-white/15 border-white/20 hover:bg-white/25 transition-all flex items-center gap-3">
                  <Coffee className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-sm font-semibold text-white">Pomodoro</div>
                    <div className="text-xs text-white/70">Quick focus</div>
                  </div>
                </a>
                <a href="/resources" className="p-3 rounded-xl border bg-white/15 border-white/20 hover:bg-white/25 transition-all flex items-center gap-3">
                  <Compass className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-sm font-semibold text-white">Resources</div>
                    <div className="text-xs text-white/70">Learn & grow</div>
                  </div>
                </a>
                <a href="/assistant" className="p-3 rounded-xl border bg-white/15 border-white/20 hover:bg-white/25 transition-all flex items-center gap-3">
                  <Headphones className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-sm font-semibold text-white">Voice Coach</div>
                    <div className="text-xs text-white/70">Talk now</div>
                  </div>
                </a>
                <a href="/tips" className="p-3 rounded-xl border bg-white/15 border-white/20 hover:bg-white/25 transition-all flex items-center gap-3">
                  <CloudRain className="w-5 h-5 text-sky-400" />
                  <div>
                    <div className="text-sm font-semibold text-white">Rainy Day</div>
                    <div className="text-xs text-white/70">Indoor tips</div>
                  </div>
                </a>
                <a href="/mind-balance" className="p-3 rounded-xl border bg-white/15 border-white/20 hover:bg-white/25 transition-all flex items-center gap-3">
                  <Moon className="w-5 h-5 text-indigo-400" />
                  <div>
                    <div className="text-sm font-semibold text-white">Wind Down</div>
                    <div className="text-xs text-white/70">Night routine</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Enhanced widgets for classic mode */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-400/30">
              <h3 className="text-white text-lg font-bold mb-4 flex items-center">
                🌤️ Weather & Time Features
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TimeWidget />
                <ActivitySuggestions />
              </div>
            </div>
            <div className="mt-4">
              <WeatherForecast />
            </div>
          </GlassmorphismCard>
        </motion.div>
        )}

        {/* Wellness & Entertainment Hub - New Feature Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 sm:mb-8"
        >
          <GlassmorphismCard variant="hero" intensity="strong" className="p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                🌟 Wellness & Entertainment Hub
              </h2>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl"
              >
                <Sparkles className="h-5 w-5 text-purple-600" />
              </motion.div>
            </div>
            
            {/* Quick Access Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Jokes Section */}
              <motion.a
                href="/jokes"
                className="block p-3 sm:p-4 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 backdrop-blur-sm rounded-xl border border-yellow-300/30 hover:border-yellow-400/50 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-2 bg-yellow-500/30 rounded-lg">
                    <Smile className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white">Jokes & Humor</span>
                  <span className="text-xs text-white/70">Lift your mood</span>
                </div>
              </motion.a>

              {/* Dino Game */}
              <motion.a
                href="/diary"
                className="block p-3 sm:p-4 bg-gradient-to-br from-green-400/20 to-teal-500/20 backdrop-blur-sm rounded-xl border border-green-300/30 hover:border-green-400/50 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-2 bg-green-500/30 rounded-lg">
                    <Gamepad2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white">Dino Game</span>
                  <span className="text-xs text-white/70">Brain exercise</span>
                </div>
              </motion.a>

              {/* Breathing Exercises */}
              <motion.a
                href="/breathing"
                className="block p-3 sm:p-4 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 backdrop-blur-sm rounded-xl border border-blue-300/30 hover:border-blue-400/50 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-2 bg-blue-500/30 rounded-lg">
                    <Wind className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white">Breathing</span>
                  <span className="text-xs text-white/70">Calm & focus</span>
                </div>
              </motion.a>

              {/* Voice Assistant */}
              <motion.a
                href="/assistant"
                className="block p-3 sm:p-4 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 backdrop-blur-sm rounded-xl border border-purple-300/30 hover:border-purple-400/50 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-2 bg-purple-500/30 rounded-lg">
                    <Volume2 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white">AI Assistant</span>
                  <span className="text-xs text-white/70">Voice support</span>
                </div>
              </motion.a>

              {/* Chat Community */}
              <motion.a
                href="/chat"
                className="block p-3 sm:p-4 bg-gradient-to-br from-pink-400/20 to-rose-500/20 backdrop-blur-sm rounded-xl border border-pink-300/30 hover:border-pink-400/50 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-2 bg-pink-500/30 rounded-lg">
                    <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white">Community</span>
                  <span className="text-xs text-white/70">Connect & share</span>
                </div>
              </motion.a>

              {/* Mind Balance */}
              <motion.a
                href="/mind-balance"
                className="block p-3 sm:p-4 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 backdrop-blur-sm rounded-xl border border-indigo-300/30 hover:border-indigo-400/50 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-2 bg-indigo-500/30 rounded-lg">
                    <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white">Mind Balance</span>
                  <span className="text-xs text-white/70">Mental wellness</span>
                </div>
              </motion.a>

              {/* Exercise Library */}
              <motion.a
                href="/exercise"
                className="block p-3 sm:p-4 bg-gradient-to-br from-emerald-400/20 to-green-500/20 backdrop-blur-sm rounded-xl border border-emerald-300/30 hover:border-emerald-400/50 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <motion.div
                    className="p-2 bg-emerald-500/30 rounded-lg"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                  >
                    <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                  </motion.div>
                  <span className="text-xs sm:text-sm font-semibold text-white">Exercise</span>
                  <span className="text-xs text-white/70">Stay active</span>
                </div>
              </motion.a>

              {/* Tips & Motivation */}
              <motion.a
                href="/tips"
                className="block p-3 sm:p-4 bg-gradient-to-br from-amber-400/20 to-yellow-500/20 backdrop-blur-sm rounded-xl border border-amber-300/30 hover:border-amber-400/50 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <motion.div
                    className="p-2 bg-amber-500/30 rounded-lg"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                  >
                    <Book className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                  </motion.div>
                  <span className="text-xs sm:text-sm font-semibold text-white">Tips & Wisdom</span>
                  <span className="text-xs text-white/70">Daily motivation</span>
                </div>
              </motion.a>
            </div>

            {/* Quick Action Bar */}
            <div className="mt-6 p-3 sm:p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-200/30">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <ActionButton
                  onClick={() => window.location.href = '/emergency'}
                  size="sm"
                  className="bg-red-500/20 border-red-300/40 text-red-700 hover:bg-red-500/30"
                >
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">SOS Help</span>
                  <span className="sm:hidden">SOS</span>
                </ActionButton>
                
                <ActionButton
                  onClick={() => window.location.href = '/tracker'}
                  size="sm"
                  className="bg-blue-500/20 border-blue-300/40 text-blue-700 hover:bg-blue-500/30"
                >
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Track Habits</span>
                  <span className="sm:hidden">Track</span>
                </ActionButton>
                
                <ActionButton
                  onClick={() => window.location.href = '/profile'}
                  size="sm"
                  className="bg-green-500/20 border-green-300/40 text-green-700 hover:bg-green-500/30"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">My Profile</span>
                  <span className="sm:hidden">Profile</span>
                </ActionButton>
                
                <ActionButton
                  onClick={() => setShowLapseRescue(true)}
                  size="sm"
                  className="bg-purple-500/20 border-purple-300/40 text-purple-700 hover:bg-purple-500/30"
                >
                  <Zap className="h-4 w-4" />
                  <span className="hidden sm:inline">Quick Rescue</span>
                  <span className="sm:hidden">Rescue</span>
                </ActionButton>
              </div>
            </div>
          </GlassmorphismCard>
        </motion.div>

      {/* Habit Selection - Responsive */}
      {habits.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 sm:mb-6"
        >
          <label className="block text-sm font-medium text-white/90 mb-2">
            Select Habit to View
          </label>
          <select
            value={selectedHabit?.id || ''}
            onChange={(e) => {
              const habit = habits.find(h => h.id === e.target.value)
              if (habit) handleHabitSelect(habit)
            }}
            className="input w-full sm:max-w-xs"
          >
            {habits.map((habit) => (
              <option key={habit.id} value={habit.id}>
                {habit.name}
              </option>
            ))}
          </select>
        </motion.div>
      )}

      {/* Quick Action - Responsive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-6 sm:mb-8"
      >
        <GlassmorphismCard variant="hero" intensity="strong" className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Today's Progress: {selectedHabit?.name}
            </h2>
            {isLoggedToday && (
              <motion.div 
                className="flex items-center text-emerald-400"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                <span className="text-base sm:text-lg font-semibold">Completed ✨</span>
              </motion.div>
            )}
          </div>
          
          {!isLoggedToday ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-6 sm:space-y-0 sm:space-x-6">
              <div className="flex space-x-4">
                <HeartButton
                  onClick={() => logToday(1)}
                  size="md"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Mark as Success</span>
                </HeartButton>
                <WonderButton
                  onClick={() => logToday(0)}
                  variant="danger"
                  size="md"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Had a Setback</span>
                </WonderButton>
              </div>
              
              {/* Emergency Lapse Rescue Button */}
              <div className="border-l border-white/30 pl-6">
                <MagicButton
                  onClick={() => setShowLapseRescue(true)}
                  size="lg"
                  className="shadow-2xl"
                >
                  <Heart className="h-5 w-5" />
                  <Zap className="h-5 w-5" />
                  <span>康复救援 Emergency Rescue</span>
                </MagicButton>
                <p className="text-xs text-gray-700 mt-3 text-center font-medium">
                  感到困难时点击 (Click when feeling overwhelmed)
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <p className="text-emerald-400 font-semibold text-lg mb-4 sm:mb-0">
                Great job! You've successfully completed today's goal. 🎉
              </p>
              
              {/* Lapse Rescue button available even on successful days */}
              <ActionButton
                onClick={() => setShowLapseRescue(true)}
                size="md"
              >
                <Heart className="h-4 w-4" />
                <span>Wellness Tools</span>
              </ActionButton>
            </div>
          )}
        </GlassmorphismCard>
      </motion.div>

      {/* Stats Cards - Responsive Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8"
      >
        <GlassmorphismCard variant="floating" intensity="strong" className="p-3 sm:p-4 lg:p-6" hover3D={true}>
          <div className="flex items-center">
            <motion.div 
              className="p-2 sm:p-3 bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-sm rounded-xl border border-blue-300/40"
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
            </motion.div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-white/80">Current Streak</p>
              <motion.p 
                className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                {currentStreak} days
              </motion.p>
            </div>
          </div>
        </GlassmorphismCard>

        <GlassmorphismCard variant="floating" intensity="strong" className="p-3 sm:p-4 lg:p-6" hover3D={true}>
          <div className="flex items-center">
            <motion.div 
              className="p-2 sm:p-3 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 backdrop-blur-sm rounded-xl border border-emerald-300/40"
              whileHover={{ rotate: -15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Award className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-emerald-600" />
            </motion.div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-white/80">Best Streak</p>
              <motion.p 
                className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
              >
                {longestStreak} days
              </motion.p>
            </div>
          </div>
        </GlassmorphismCard>

        <GlassmorphismCard variant="floating" intensity="strong" className="p-6" hover3D={true}>
          <div className="flex items-center">
            <motion.div 
              className="p-3 bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-sm rounded-xl border border-purple-300/40"
              whileHover={{ rotate: -15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Target className="h-6 w-6 text-purple-600" />
            </motion.div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white/80">Total Days</p>
              <motion.p 
                className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
              >
                {totalDays}
              </motion.p>
            </div>
          </div>
        </GlassmorphismCard>
      </motion.div>

      {/* Daily Mood & Reflection Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mb-6 sm:mb-8"
      >
        <GlassmorphismCard variant="hero" intensity="strong" className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              🌈 Today's Mood & Reflection
            </h3>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              <Heart className="h-5 w-5 text-pink-500" />
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Mood Selection */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-sm sm:text-base font-semibold text-white/90">How are you feeling today?</h4>
              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {[
                  { emoji: '😢', mood: 'sad', color: 'from-blue-400 to-blue-600' },
                  { emoji: '😐', mood: 'neutral', color: 'from-gray-400 to-gray-600' },
                  { emoji: '🙂', mood: 'okay', color: 'from-yellow-400 to-yellow-600' },
                  { emoji: '😊', mood: 'good', color: 'from-green-400 to-green-600' },
                  { emoji: '🤗', mood: 'amazing', color: 'from-purple-400 to-purple-600' }
                ].map((item, index) => (
                  <motion.button
                    key={item.mood}
                    className={`p-3 sm:p-4 bg-gradient-to-br ${item.color} bg-opacity-20 backdrop-blur-sm rounded-xl border border-white/30 hover:scale-110 transition-all duration-300`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      // Add mood tracking logic here
                      console.log('Mood selected:', item.mood)
                    }}
                  >
                    <div className="text-2xl sm:text-3xl">{item.emoji}</div>
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Quick Reflection */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-sm sm:text-base font-semibold text-white/90">Quick Reflection</h4>
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                {[
                  { icon: '🎯', text: 'Set intention for today', action: () => window.location.href = '/tracker' },
                  { icon: '🙏', text: 'Practice gratitude', action: () => window.location.href = '/diary' },
                  { icon: '💪', text: 'Review my progress', action: () => window.location.href = '/profile' },
                  { icon: '🌱', text: 'Plan self-care activity', action: () => window.location.href = '/mind-balance' }
                ].map((item, index) => (
                  <motion.button
                    key={index}
                    className="flex items-center p-2 sm:p-3 bg-white/15 backdrop-blur-sm rounded-lg border border-white/20 hover:border-white/30 transition-all duration-300 text-left"
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={item.action}
                  >
                    <span className="text-lg mr-3">{item.icon}</span>
                    <span className="text-xs sm:text-sm font-medium text-white/90">{item.text}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Daily Quote/Tip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-200/30"
          >
            <div className="flex items-start space-x-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex-shrink-0 p-2 bg-indigo-500/20 rounded-lg"
              >
                <Sparkles className="h-4 w-4 text-indigo-600" />
              </motion.div>
              <div>
                <h5 className="text-xs sm:text-sm font-semibold text-white/90 mb-1">💭 Daily Wisdom</h5>
                <p className="text-xs sm:text-sm text-white/70 italic">
                  "Every small step forward is a victory worth celebrating. Your journey of recovery is unique and valuable."
                </p>
              </div>
            </div>
          </motion.div>
        </GlassmorphismCard>
      </motion.div>

      {/* Charts - Responsive */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Weekly Progress</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day" 
                fontSize={12}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Streak Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day" 
                fontSize={12}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Badges */}
      {badges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Recent Achievements</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.slice(0, 6).map((userBadge) => (
              <div
                key={userBadge.id}
                className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                  <Award className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {userBadge.badges?.name || 'Achievement'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {dateUtils.formatDisplayDate(userBadge.awarded_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Lapse Rescue Mode Modal */}
      <LapseRescueMode 
        isOpen={showLapseRescue}
        onClose={() => setShowLapseRescue(false)}
      />
      </div>
    </OppenheimerBackground>
  )
}

export default Dashboard
