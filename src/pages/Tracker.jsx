import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/supabase'
import { dateUtils, streakUtils } from '../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Target, Calendar, Edit, Trash2, CheckCircle, XCircle, 
  Calendar as CalendarIcon, BarChart3, TrendingUp, Award, 
  Bell, Filter, Grid, List, ChevronLeft, ChevronRight,
  Heart, Brain, Moon, Book, Dumbbell, Users, Coffee, Smartphone,
  Smile, Meh, Frown, MessageCircle, PieChart, Star
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import GlassmorphismCard from '../components/GlassmorphismCard'

const Tracker = () => {
  const { user } = useAuth()
  const [habits, setHabits] = useState([])
  const [habitLogs, setHabitLogs] = useState({})
  const [loading, setLoading] = useState(true)
  const [showNewHabitForm, setShowNewHabitForm] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitDescription, setNewHabitDescription] = useState('')
  const [newHabitCategory, setNewHabitCategory] = useState('health')
  const [selectedDate, setSelectedDate] = useState(dateUtils.today())
  
  // New features state
  const [viewMode, setViewMode] = useState('grid') // 'grid', 'list', 'calendar'
  const [filterCategory, setFilterCategory] = useState('all')
  const [showStats, setShowStats] = useState(false)
  const [showReflection, setShowReflection] = useState(false)
  const [selectedMood, setSelectedMood] = useState(null)
  const [reflectionText, setReflectionText] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showNotificationSetup, setShowNotificationSetup] = useState(false)
  const [weeklyReport, setWeeklyReport] = useState(null)
  
  // Categories with icons and colors
  const categories = {
    health: { name: 'Health', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
    mind: { name: 'Mind', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50' },
    sleep: { name: 'Sleep', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    learning: { name: 'Learning', icon: Book, color: 'text-blue-500', bg: 'bg-blue-50' },
    fitness: { name: 'Fitness', icon: Dumbbell, color: 'text-green-500', bg: 'bg-green-50' },
    social: { name: 'Social', icon: Users, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    habits: { name: 'Daily Habits', icon: Coffee, color: 'text-orange-500', bg: 'bg-orange-50' },
    digital: { name: 'Digital Wellness', icon: Smartphone, color: 'text-gray-500', bg: 'bg-gray-50' }
  }
  
  // Mood options
  const moods = [
    { id: 'great', emoji: '😄', name: 'Great', color: 'text-green-500' },
    { id: 'good', emoji: '😊', name: 'Good', color: 'text-blue-500' },
    { id: 'okay', emoji: '😐', name: 'Okay', color: 'text-yellow-500' },
    { id: 'bad', emoji: '😔', name: 'Bad', color: 'text-orange-500' },
    { id: 'terrible', emoji: '😢', name: 'Terrible', color: 'text-red-500' }
  ]

  useEffect(() => {
    if (user) {
      loadHabits()
      generateWeeklyReport()
      checkForWeeklyReflection()
    }
  }, [user])

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const loadHabits = async () => {
    try {
      const habitsData = await db.getHabits(user.id)
      setHabits(habitsData || [])

      // Load logs for each habit
      const logsData = {}
      for (const habit of habitsData || []) {
        const logs = await db.getHabitLogs(habit.id)
        logsData[habit.id] = logs || []
      }
      setHabitLogs(logsData)
    } catch (error) {
      console.error('Error loading habits:', error)
    } finally {
      setLoading(false)
    }
  }

  const createHabit = async (e) => {
    e.preventDefault()
    if (!newHabitName.trim()) return

    try {
      const newHabit = await db.createHabit({
        user_id: user.id,
        name: newHabitName.trim(),
        description: newHabitDescription.trim(),
        category: newHabitCategory,
        created_at: new Date().toISOString()
      })

      setHabits([newHabit, ...habits])
      setHabitLogs({ ...habitLogs, [newHabit.id]: [] })
      setNewHabitName('')
      setNewHabitDescription('')
      setNewHabitCategory('health')
      setShowNewHabitForm(false)
    } catch (error) {
      console.error('Error creating habit:', error)
    }
  }

  const toggleHabitLog = async (habitId, date, currentValue) => {
    const newValue = currentValue > 0 ? 0 : 1

    try {
      await db.logHabit({
        habit_id: habitId,
        date: date,
        value: newValue,
        mood: selectedMood,
        note: ''
      })

      // Update local state
      const updatedLogs = [...(habitLogs[habitId] || [])]
      const existingLogIndex = updatedLogs.findIndex(log => log.date === date)
      
      if (existingLogIndex >= 0) {
        updatedLogs[existingLogIndex] = { ...updatedLogs[existingLogIndex], value: newValue, mood: selectedMood }
      } else {
        updatedLogs.push({ habit_id: habitId, date, value: newValue, mood: selectedMood, note: '' })
      }

      setHabitLogs({
        ...habitLogs,
        [habitId]: updatedLogs
      })

      // Show mood selector if habit completed
      if (newValue > 0) {
        setSelectedMood(null)
        // Could trigger mood selection here
      }

      // Progressive difficulty check
      checkProgressiveDifficulty(habitId, updatedLogs)
      
    } catch (error) {
      console.error('Error updating habit log:', error)
    }
  }

  const checkProgressiveDifficulty = (habitId, logs) => {
    // Auto-suggest increasing difficulty based on success rate
    const recentLogs = logs.slice(-14) // Last 2 weeks
    const successRate = recentLogs.filter(log => log.value > 0).length / recentLogs.length
    
    if (successRate >= 0.8 && recentLogs.length >= 14) {
      // Show suggestion to increase difficulty
      console.log('Suggest increasing difficulty for habit', habitId)
    }
  }

  const generateWeeklyReport = () => {
    if (!habits.length) return

    const weekStart = dateUtils.daysAgo(7)
    const weekEnd = dateUtils.today()
    
    let totalHabits = 0
    let completedHabits = 0
    let bestHabit = null
    let longestStreak = 0

    habits.forEach(habit => {
      const logs = habitLogs[habit.id] || []
      const weekLogs = logs.filter(log => log.date >= weekStart && log.date <= weekEnd)
      const weekCompleted = weekLogs.filter(log => log.value > 0).length
      
      totalHabits += weekLogs.length
      completedHabits += weekCompleted
      
      const streak = streakUtils.calculateStreak(logs)
      if (streak > longestStreak) {
        longestStreak = streak
        bestHabit = habit.name
      }
    })

    const completionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0

    setWeeklyReport({
      completionRate,
      bestHabit,
      longestStreak,
      totalCompleted: completedHabits,
      totalPossible: totalHabits
    })
  }

  const checkForWeeklyReflection = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    
    // Show reflection prompt on Sundays
    if (dayOfWeek === 0) {
      const lastReflection = localStorage.getItem('lastReflection')
      const today = dateUtils.today()
      
      if (lastReflection !== today) {
        setShowReflection(true)
      }
    }
  }

  const saveReflection = async () => {
    try {
      await db.saveReflection({
        user_id: user.id,
        date: dateUtils.today(),
        reflection: reflectionText,
        week_completion_rate: weeklyReport?.completionRate || 0
      })
      
      localStorage.setItem('lastReflection', dateUtils.today())
      setShowReflection(false)
      setReflectionText('')
    } catch (error) {
      console.error('Error saving reflection:', error)
    }
  }

  const setupNotifications = (habitId, time) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      // This would integrate with a proper notification system
      console.log('Setting up notification for habit', habitId, 'at', time)
    }
  }

  const getLogValue = (habitId, date) => {
    const logs = habitLogs[habitId] || []
    const log = logs.find(l => l.date === date)
    return log ? log.value : 0
  }

  const generateWeekDates = (baseDate) => {
    const dates = []
    for (let i = 6; i >= 0; i--) {
      dates.push(dateUtils.daysAgo(i))
    }
    return dates
  }

  const generateCalendarDates = (month) => {
    const year = month.getFullYear()
    const monthNum = month.getMonth()
    const firstDay = new Date(year, monthNum, 1)
    const lastDay = new Date(year, monthNum + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const dates = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  const getHabitStats = (habitId) => {
    const logs = habitLogs[habitId] || []
    const currentStreak = streakUtils.calculateStreak(logs)
    const longestStreak = streakUtils.getLongestStreak(logs)
    const totalSuccessful = logs.filter(log => log.value > 0).length
    const totalDays = logs.length
    const successRate = totalDays > 0 ? Math.round((totalSuccessful / totalDays) * 100) : 0
    
    // This week stats
    const weekStart = dateUtils.daysAgo(7)
    const weekLogs = logs.filter(log => log.date >= weekStart)
    const weekCompleted = weekLogs.filter(log => log.value > 0).length
    const weekTotal = 7
    const weekProgress = Math.round((weekCompleted / weekTotal) * 100)
    
    return {
      currentStreak,
      longestStreak,
      totalSuccessful,
      totalDays,
      successRate,
      weekProgress,
      weekCompleted,
      weekTotal
    }
  }

  const filteredHabits = habits.filter(habit => 
    filterCategory === 'all' || habit.category === filterCategory
  )

  const renderCalendarView = () => {
    const calendarDates = generateCalendarDates(currentMonth)
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Calendar View</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="font-medium text-gray-900 min-w-[150px] text-center">
              {monthName}
            </span>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {calendarDates.map(date => {
            const isCurrentMonth = new Date(date).getMonth() === currentMonth.getMonth()
            const isToday = date === dateUtils.today()
            const completedHabits = filteredHabits.filter(habit => getLogValue(habit.id, date) > 0).length
            const totalHabits = filteredHabits.length
            const completionRate = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0
            
            return (
              <div
                key={date}
                className={`p-2 h-20 border border-gray-100 ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'ring-2 ring-primary-500' : ''}`}
              >
                <div className={`text-sm mb-1 ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {new Date(date).getDate()}
                </div>
                {isCurrentMonth && totalHabits > 0 && (
                  <div className="space-y-1">
                    <div className={`text-xs ${
                      completionRate === 100 ? 'text-green-600' :
                      completionRate >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {completedHabits}/{totalHabits}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full ${
                          completionRate === 100 ? 'bg-green-500' :
                          completionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  const weekDates = generateWeekDates(selectedDate)

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header with enhanced controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <Target className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-primary-600" />
            Habit Tracker Pro
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Build lasting habits with AI-powered insights and motivation</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 lg:mt-0">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 sm:p-2 rounded text-xs sm:text-sm ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Grid className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 sm:p-2 rounded text-xs sm:text-sm ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <List className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 sm:p-2 rounded text-xs sm:text-sm ${viewMode === 'calendar' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
          
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input text-sm py-2"
          >
            <option value="all">All Categories</option>
            {Object.entries(categories).map(([key, cat]) => (
              <option key={key} value={key}>{cat.name}</option>
            ))}
          </select>
          
          {/* Action Buttons */}
          <button
            onClick={() => setShowStats(!showStats)}
            className="btn-secondary flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Stats</span>
          </button>
          
          <button
            onClick={() => setShowNewHabitForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Habit</span>
          </button>
        </div>
      </div>

      {/* Weekly Report Banner */}
      {weeklyReport && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-8 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 This Week's Progress</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold text-primary-600">{weeklyReport.completionRate}%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{weeklyReport.longestStreak}</div>
                  <div className="text-sm text-gray-600">Best Streak</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{weeklyReport.totalCompleted}</div>
                  <div className="text-sm text-gray-600">Habits Completed</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Best Habit:</div>
                  <div className="font-semibold text-gray-900">{weeklyReport.bestHabit || 'None yet'}</div>
                </div>
              </div>
            </div>
            <Award className="h-12 w-12 text-yellow-500" />
          </div>
        </motion.div>
      )}

      {/* Enhanced New Habit Form */}
      <AnimatePresence>
        {showNewHabitForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card mb-8 border-2 border-primary-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-primary-600" />
              Create New Habit
            </h3>
            <form onSubmit={createHabit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="habitName" className="block text-sm font-medium text-gray-700 mb-1">
                    Habit Name *
                  </label>
                  <input
                    id="habitName"
                    type="text"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="e.g., Exercise 30 minutes, Read for 20 minutes"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="habitCategory" className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    id="habitCategory"
                    value={newHabitCategory}
                    onChange={(e) => setNewHabitCategory(e.target.value)}
                    className="input"
                    required
                  >
                    {Object.entries(categories).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="habitDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description & Goal (optional)
                </label>
                <textarea
                  id="habitDescription"
                  value={newHabitDescription}
                  onChange={(e) => setNewHabitDescription(e.target.value)}
                  placeholder="Describe your goal, motivation, or specific details..."
                  rows={3}
                  className="input"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Create Habit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewHabitForm(false)
                    setNewHabitName('')
                    setNewHabitDescription('')
                    setNewHabitCategory('health')
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly Reflection Modal */}
      <AnimatePresence>
        {showReflection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex items-center mb-4">
                <MessageCircle className="h-6 w-6 text-primary-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Weekly Reflection</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Take a moment to reflect on your week. What went well? What can you improve?
              </p>
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Share your thoughts about this week's progress..."
                rows={4}
                className="input mb-4"
              />
              <div className="flex space-x-3">
                <button
                  onClick={saveReflection}
                  className="btn-primary"
                >
                  Save Reflection
                </button>
                <button
                  onClick={() => setShowReflection(false)}
                  className="btn-secondary"
                >
                  Skip
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Based on View Mode */}
      {viewMode === 'calendar' ? (
        renderCalendarView()
      ) : (
        <>
          {/* Enhanced Statistics Dashboard */}
          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                  {/* Overall Statistics */}
                  <div className="card text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">
                      {Math.round(filteredHabits.reduce((acc, habit) => {
                        const stats = getHabitStats(habit.id)
                        return acc + stats.successRate
                      }, 0) / (filteredHabits.length || 1))}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Success Rate</div>
                  </div>
                  
                  <div className="card text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {Math.max(...filteredHabits.map(habit => getHabitStats(habit.id).currentStreak), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Longest Current Streak</div>
                  </div>
                  
                  <div className="card text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {filteredHabits.reduce((acc, habit) => acc + getHabitStats(habit.id).totalSuccessful, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Completions</div>
                  </div>
                  
                  <div className="card text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {filteredHabits.length}
                    </div>
                    <div className="text-sm text-gray-600">Active Habits</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Habits Display */}
          {filteredHabits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filterCategory === 'all' ? 'No habits yet' : `No ${categories[filterCategory]?.name} habits yet`}
              </h3>
              <p className="text-gray-500 mb-6">
                {filterCategory === 'all' 
                  ? 'Create your first habit to start tracking your progress.'
                  : `Add a ${categories[filterCategory]?.name} habit to get started.`
                }
              </p>
              <button
                onClick={() => setShowNewHabitForm(true)}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create First Habit</span>
              </button>
            </motion.div>
          ) : viewMode === 'grid' ? (
            <div className="space-y-6">
              {/* Week Header */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    This Week's Progress
                  </h3>
                  <div className="text-sm text-gray-500">
                    {dateUtils.formatDisplayDate(weekDates[0])} - {dateUtils.formatDisplayDate(weekDates[6])}
                  </div>
                </div>
                
                <div className="grid grid-cols-8 gap-2 mb-4">
                  <div className="text-sm font-medium text-gray-700"></div>
                  {weekDates.map((date, index) => (
                    <div key={date} className="text-center">
                      <div className="text-xs text-gray-500 mb-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}
                      </div>
                      <div className={`text-sm font-medium ${
                        date === dateUtils.today() ? 'text-primary-600' : 'text-gray-700'
                      }`}>
                        {new Date(date).getDate()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Enhanced Habits Grid */}
                <div className="space-y-3">
                  {filteredHabits.map((habit) => {
                    const stats = getHabitStats(habit.id)
                    const CategoryIcon = categories[habit.category]?.icon || Target

                    return (
                      <motion.div
                        key={habit.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-8 gap-2 items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center mb-1">
                            <div className={`p-1 rounded ${categories[habit.category]?.bg} mr-2`}>
                              <CategoryIcon className={`h-4 w-4 ${categories[habit.category]?.color}`} />
                            </div>
                            <div className="font-medium text-gray-900 text-sm">{habit.name}</div>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center space-x-3">
                            <span>🔥 {stats.currentStreak} days</span>
                            <span>📈 {stats.successRate}%</span>
                          </div>
                          {/* Progress bar for this week */}
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-primary-500 h-1 rounded-full transition-all"
                              style={{ width: `${stats.weekProgress}%` }}
                            />
                          </div>
                        </div>
                        
                        {weekDates.map((date) => {
                          const logValue = getLogValue(habit.id, date)
                          const isToday = date === dateUtils.today()
                          const isFuture = new Date(date) > new Date()
                          
                          return (
                            <div key={date} className="flex justify-center">
                              <button
                                onClick={() => !isFuture && toggleHabitLog(habit.id, date, logValue)}
                                disabled={isFuture}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${
                                  isFuture
                                    ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
                                    : logValue > 0
                                    ? 'border-green-500 bg-green-500 text-white hover:bg-green-600 hover:scale-110'
                                    : isToday
                                    ? 'border-primary-500 bg-white hover:bg-primary-50 hover:scale-105'
                                    : 'border-gray-300 bg-white hover:bg-gray-50'
                                }`}
                              >
                                {!isFuture && logValue > 0 && (
                                  <CheckCircle className="h-4 w-4 mx-auto" />
                                )}
                                {!isFuture && logValue === 0 && isToday && (
                                  <div className="w-2 h-2 bg-primary-500 rounded-full mx-auto" />
                                )}
                              </button>
                            </div>
                          )
                        })}
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Enhanced Habit Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredHabits.map((habit) => {
                  const stats = getHabitStats(habit.id)
                  const CategoryIcon = categories[habit.category]?.icon || Target

                  return (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="card hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg ${categories[habit.category]?.bg} mr-3`}>
                            <CategoryIcon className={`h-5 w-5 ${categories[habit.category]?.color}`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{habit.name}</h4>
                            <div className="text-xs text-gray-500">{categories[habit.category]?.name}</div>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => setupNotifications(habit.id, '09:00')}
                            className="text-gray-400 hover:text-blue-600 p-1"
                            title="Set reminder"
                          >
                            <Bell className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600 p-1">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-red-600 p-1">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {habit.description && (
                        <p className="text-sm text-gray-600 mb-4">{habit.description}</p>
                      )}
                      
                      <div className="grid grid-cols-3 gap-3 text-center mb-4">
                        <div>
                          <div className="text-2xl font-bold text-primary-600">{stats.currentStreak}</div>
                          <div className="text-xs text-gray-500">Current Streak</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">{stats.longestStreak}</div>
                          <div className="text-xs text-gray-500">Best Streak</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{stats.successRate}%</div>
                          <div className="text-xs text-gray-500">Success Rate</div>
                        </div>
                      </div>
                      
                      {/* This week progress */}
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">This Week</span>
                          <span className="font-medium text-gray-900">
                            {stats.weekCompleted}/{stats.weekTotal} days
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              stats.weekProgress === 100 ? 'bg-green-500' :
                              stats.weekProgress >= 70 ? 'bg-primary-500' :
                              stats.weekProgress >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${stats.weekProgress}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ) : (
            // List View
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <List className="h-5 w-5 mr-2" />
                Habits List
              </h3>
              <div className="space-y-4">
                {filteredHabits.map((habit) => {
                  const stats = getHabitStats(habit.id)
                  const CategoryIcon = categories[habit.category]?.icon || Target
                  const todayValue = getLogValue(habit.id, dateUtils.today())

                  return (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => toggleHabitLog(habit.id, dateUtils.today(), todayValue)}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            todayValue > 0
                              ? 'border-green-500 bg-green-500 text-white hover:bg-green-600'
                              : 'border-gray-300 bg-white hover:bg-primary-50 hover:border-primary-500'
                          }`}
                        >
                          {todayValue > 0 ? (
                            <CheckCircle className="h-5 w-5 mx-auto" />
                          ) : (
                            <div className="w-3 h-3 border-2 border-gray-400 rounded-full mx-auto" />
                          )}
                        </button>
                        
                        <div className={`p-2 rounded-lg ${categories[habit.category]?.bg}`}>
                          <CategoryIcon className={`h-5 w-5 ${categories[habit.category]?.color}`} />
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900">{habit.name}</h4>
                          <div className="text-sm text-gray-500 flex items-center space-x-4">
                            <span>🔥 {stats.currentStreak} day streak</span>
                            <span>📈 {stats.successRate}% success</span>
                            <span className="text-xs px-2 py-1 bg-white rounded-full">
                              {categories[habit.category]?.name}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-right text-sm">
                          <div className="font-medium text-gray-900">
                            {stats.weekCompleted}/7 this week
                          </div>
                          <div className="text-gray-500">
                            {stats.weekProgress}% complete
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => setupNotifications(habit.id, '09:00')}
                            className="text-gray-400 hover:text-blue-600 p-1"
                          >
                            <Bell className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600 p-1">
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Mood Selector (appears when completing a habit) */}
      <AnimatePresence>
        {selectedMood === null && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200"
          >
            <h4 className="text-sm font-medium text-gray-900 mb-2">How are you feeling?</h4>
            <div className="flex space-x-2">
              {moods.map(mood => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  title={mood.name}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Tracker
