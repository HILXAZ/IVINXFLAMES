import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Award, 
  Flame,
  Heart,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const QuickStatsWidget = () => {
  const [stats, setStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalDays: 0,
    moneySaved: 0,
    healthScore: 0,
    lastUpdate: null,
    todayStatus: 'success' // success, warning, danger
  })
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        await loadStats(user.id)
      } else {
        // Demo stats for non-authenticated users
        setStats({
          currentStreak: 15,
          longestStreak: 23,
          totalDays: 127,
          moneySaved: 450,
          healthScore: 78,
          lastUpdate: new Date(),
          todayStatus: 'success'
        })
        setLoading(false)
      }
    } catch (error) {
      console.error('Error getting user:', error)
      setLoading(false)
    }
  }

  const loadStats = async (userId) => {
    try {
      // Get habit logs for calculations
      const { data: habitLogs, error: habitError } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true })

      if (habitError) throw habitError

      // Calculate statistics
      const calculatedStats = calculateStats(habitLogs)
      setStats(calculatedStats)
      setLoading(false)
    } catch (error) {
      console.error('Error loading stats:', error)
      setLoading(false)
    }
  }

  const calculateStats = (logs) => {
    if (!logs || logs.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalDays: 0,
        moneySaved: 0,
        healthScore: 0,
        lastUpdate: new Date(),
        todayStatus: 'warning'
      }
    }

    // Calculate current streak
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let totalSuccessfulDays = 0
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayLog = logs.find(log => {
      const logDate = new Date(log.date)
      logDate.setHours(0, 0, 0, 0)
      return logDate.getTime() === today.getTime()
    })

    // Sort logs by date descending for current streak calculation
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date))
    
    // Calculate current streak (consecutive successful days from today backwards)
    for (const log of sortedLogs) {
      const logDate = new Date(log.date)
      logDate.setHours(0, 0, 0, 0)
      
      if (log.completed && log.craving_level <= 3) { // Consider low craving as success
        if (logDate <= today) {
          currentStreak++
        }
      } else {
        break
      }
    }

    // Calculate longest streak and total successful days
    for (const log of logs) {
      if (log.completed && log.craving_level <= 3) {
        tempStreak++
        totalSuccessfulDays++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }

    // Calculate money saved (assuming $15 per day average addiction cost)
    const moneySaved = totalSuccessfulDays * 15

    // Calculate health score (based on recent performance)
    const recentLogs = logs.slice(-30) // Last 30 days
    const recentSuccessRate = recentLogs.length > 0 
      ? (recentLogs.filter(log => log.completed && log.craving_level <= 3).length / recentLogs.length) * 100
      : 0
    
    const healthScore = Math.round(recentSuccessRate)

    // Determine today's status
    let todayStatus = 'warning'
    if (todayLog) {
      if (todayLog.completed && todayLog.craving_level <= 3) {
        todayStatus = 'success'
      } else if (todayLog.craving_level > 7) {
        todayStatus = 'danger'
      }
    }

    return {
      currentStreak,
      longestStreak,
      totalDays: totalSuccessfulDays,
      moneySaved,
      healthScore,
      lastUpdate: new Date(),
      todayStatus
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'green'
      case 'warning': return 'yellow'
      case 'danger': return 'red'
      default: return 'gray'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return CheckCircle
      case 'warning': return Clock
      case 'danger': return AlertCircle
      default: return Clock
    }
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/20 rounded w-1/2"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-white/20 rounded"></div>
            <div className="h-16 bg-white/20 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const StatusIcon = getStatusIcon(stats.todayStatus)
  const statusColor = getStatusColor(stats.todayStatus)

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 text-white">
      {/* Header with today's status */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recovery Stats</h3>
        <motion.div
          className={`flex items-center space-x-2 bg-${statusColor}-500/20 border border-${statusColor}-400/30 rounded-lg px-3 py-1`}
          whileHover={{ scale: 1.05 }}
        >
          <StatusIcon className={`w-4 h-4 text-${statusColor}-400`} />
          <span className="text-sm font-medium capitalize">{stats.todayStatus}</span>
        </motion.div>
      </div>

      {/* Main stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Current streak */}
        <motion.div
          className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg p-4 border border-orange-400/30"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center space-x-3">
            <Flame className="w-6 h-6 text-orange-400" />
            <div>
              <div className="text-2xl font-bold">{stats.currentStreak}</div>
              <div className="text-sm text-white/70">Current Streak</div>
            </div>
          </div>
        </motion.div>

        {/* Longest streak */}
        <motion.div
          className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-400/30"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center space-x-3">
            <Award className="w-6 h-6 text-purple-400" />
            <div>
              <div className="text-2xl font-bold">{stats.longestStreak}</div>
              <div className="text-sm text-white/70">Best Streak</div>
            </div>
          </div>
        </motion.div>

        {/* Total days */}
        <motion.div
          className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-4 border border-green-400/30"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-green-400" />
            <div>
              <div className="text-2xl font-bold">{stats.totalDays}</div>
              <div className="text-sm text-white/70">Success Days</div>
            </div>
          </div>
        </motion.div>

        {/* Health score */}
        <motion.div
          className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-4 border border-blue-400/30"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center space-x-3">
            <Heart className="w-6 h-6 text-blue-400" />
            <div>
              <div className="text-2xl font-bold">{stats.healthScore}%</div>
              <div className="text-sm text-white/70">Health Score</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Money saved section */}
      <motion.div
        className="bg-gradient-to-r from-yellow-500/20 to-green-500/20 rounded-lg p-4 border border-yellow-400/30 mb-4"
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-6 h-6 text-yellow-400" />
            <div>
              <div className="text-xl font-bold">${stats.moneySaved}</div>
              <div className="text-sm text-white/70">Money Saved</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/70">Daily avg: $15</div>
            <div className="text-xs text-white/50">Based on typical costs</div>
          </div>
        </div>
      </motion.div>

      {/* Progress indicators */}
      <div className="space-y-3">
        {/* Streak progress to next milestone */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-white/70">Next Milestone</span>
            <span className="text-sm font-medium">
              {stats.currentStreak}/
              {stats.currentStreak < 7 ? 7 : 
               stats.currentStreak < 30 ? 30 : 
               stats.currentStreak < 100 ? 100 : 365} days
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full"
              style={{ 
                width: `${Math.min(100, (stats.currentStreak / 
                  (stats.currentStreak < 7 ? 7 : 
                   stats.currentStreak < 30 ? 30 : 
                   stats.currentStreak < 100 ? 100 : 365)) * 100)}%` 
              }}
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.min(100, (stats.currentStreak / 
                  (stats.currentStreak < 7 ? 7 : 
                   stats.currentStreak < 30 ? 30 : 
                   stats.currentStreak < 100 ? 100 : 365)) * 100)}%` 
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Health progress */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-white/70">Health Progress</span>
            <span className="text-sm font-medium">{stats.healthScore}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-400 to-green-500 h-2 rounded-full"
              style={{ width: `${stats.healthScore}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${stats.healthScore}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Last update */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-center space-x-2 text-xs text-white/50">
          <TrendingUp className="w-3 h-3" />
          <span>Updated {stats.lastUpdate?.toLocaleTimeString() || 'recently'}</span>
        </div>
      </div>
    </div>
  )
}

export default QuickStatsWidget
