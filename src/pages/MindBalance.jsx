import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, Heart, Zap, Activity, Target, BarChart3, 
  Wind, Sparkles, Timer, TrendingUp, Award, Calendar 
} from 'lucide-react'
import MindBalanceTracker from '../components/MindBalanceTracker'
import BreathingCoherence from '../components/BreathingCoherence'
import CognitiveBalanceExercises from '../components/CognitiveBalanceExercises'

// Main Mind Balance Page - Central hub for all balance features
const MindBalance = () => {
  const [activeModule, setActiveModule] = useState('overview')
  const [userProgress, setUserProgress] = useState(() => {
    const saved = localStorage.getItem('mind_balance_progress')
    return saved ? JSON.parse(saved) : {
      totalSessions: 0,
      streakDays: 0,
      lastActivity: null,
      achievements: [],
      balanceScore: 50,
      weeklyGoals: {
        breathing: 0,
        cognitive: 0,
        checkins: 0,
        urge_surfing: 0
      },
      weeklyProgress: {
        breathing: 0,
        cognitive: 0,
        checkins: 0,
        urge_surfing: 0
      }
    }
  })

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('mind_balance_progress', JSON.stringify(userProgress))
  }, [userProgress])

  const modules = {
    overview: {
      name: "Balance Overview",
      icon: BarChart3,
      color: "indigo",
      description: "Track your mind-body balance and progress"
    },
    dopamine: {
      name: "Dopamine Reset",
      icon: Zap,
      color: "yellow",
      description: "Manage dopamine load and reset activities"
    },
    breathing: {
      name: "Heart Coherence",
      icon: Wind,
      color: "blue",
      description: "Breathing exercises with biofeedback"
    },
    cognitive: {
      name: "Cognitive Training",
      icon: Brain,
      color: "purple",
      description: "Executive function and impulse control exercises"
    },
    tracker: {
      name: "Balance Tracker",
      icon: Target,
      color: "green",
      description: "Full mind balance tracking system"
    }
  }

  const handleSessionComplete = (sessionData) => {
    const newProgress = { ...userProgress }
    
    // Update session count
    newProgress.totalSessions += 1
    newProgress.lastActivity = new Date().toISOString()
    
    // Update weekly progress based on session type
    switch(sessionData.type || activeModule) {
      case 'breathing':
        newProgress.weeklyProgress.breathing += 1
        break
      case 'cognitive':
        newProgress.weeklyProgress.cognitive += 1
        break
      case 'checkins':
        newProgress.weeklyProgress.checkins += 1
        break
      case 'urge_surfing':
        newProgress.weeklyProgress.urge_surfing += 1
        break
    }
    
    // Check for achievements
    checkAchievements(newProgress, sessionData)
    
    // Update balance score based on activity
    updateBalanceScore(newProgress, sessionData)
    
    setUserProgress(newProgress)
  }

  const checkAchievements = (progress, sessionData) => {
    const achievements = []
    
    // First session achievement
    if (progress.totalSessions === 1) {
      achievements.push({
        id: 'first_session',
        title: 'First Step',
        description: 'Completed your first mind balance session',
        icon: '🌱',
        earned: new Date().toISOString()
      })
    }
    
    // Weekly goals achievements
    Object.entries(progress.weeklyProgress).forEach(([type, count]) => {
      if (count >= 5 && !progress.achievements.find(a => a.id === `${type}_week`)) {
        achievements.push({
          id: `${type}_week`,
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} Master`,
          description: `Completed 5 ${type} sessions this week`,
          icon: '🏆',
          earned: new Date().toISOString()
        })
      }
    })
    
    // Streak achievements
    if (progress.streakDays >= 7) {
      achievements.push({
        id: 'week_streak',
        title: 'Weekly Warrior',
        description: '7-day consistency streak',
        icon: '🔥',
        earned: new Date().toISOString()
      })
    }
    
    // Add new achievements
    progress.achievements = [...progress.achievements, ...achievements]
  }

  const updateBalanceScore = (progress, sessionData) => {
    let scoreIncrease = 2 // Base increase
    
    // Bonus for different activity types
    if (sessionData.type === 'breathing' && sessionData.coherence > 70) scoreIncrease += 3
    if (sessionData.type === 'cognitive' && sessionData.accuracy > 80) scoreIncrease += 3
    if (sessionData.type === 'urge_surfing') scoreIncrease += 5 // High value for urge management
    
    progress.balanceScore = Math.min(100, progress.balanceScore + scoreIncrease)
  }

  const OverviewModule = () => {
    const getBalanceStatus = () => {
      if (userProgress.balanceScore >= 80) return { text: "Excellent", color: "green", emoji: "🌟" }
      if (userProgress.balanceScore >= 60) return { text: "Good", color: "blue", emoji: "🌊" }
      if (userProgress.balanceScore >= 40) return { text: "Improving", color: "yellow", emoji: "🌱" }
      return { text: "Building", color: "red", emoji: "🔨" }
    }

    const balanceStatus = getBalanceStatus()
    const weeklyTotal = Object.values(userProgress.weeklyProgress).reduce((sum, val) => sum + val, 0)

    return (
      <div className="space-y-6">
        {/* Balance Score Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white text-center"
        >
          <div className="text-6xl font-bold mb-2">{userProgress.balanceScore}%</div>
          <div className="text-xl mb-2">Mind Balance Score</div>
          <div className="flex items-center justify-center gap-2 text-lg">
            <span>{balanceStatus.emoji}</span>
            <span>{balanceStatus.text} Balance</span>
          </div>
        </motion.div>

        {/* Weekly Progress */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="text-indigo-500" size={24} />
            This Week's Progress
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {Object.entries(userProgress.weeklyProgress).map(([type, count]) => (
              <div key={type} className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{count}</div>
                <div className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</div>
              </div>
            ))}
          </div>
          
          <div className="text-center text-gray-600">
            <strong>{weeklyTotal}</strong> total sessions this week
          </div>
        </div>

        {/* Recent Achievements */}
        {userProgress.achievements.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Award className="text-yellow-500" size={24} />
              Recent Achievements
            </h3>
            
            <div className="space-y-3">
              {userProgress.achievements.slice(-3).map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <div className="font-medium">{achievement.title}</div>
                    <div className="text-sm text-gray-600">{achievement.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(modules).filter(([key]) => key !== 'overview').map(([key, module]) => {
            const IconComponent = module.icon
            return (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveModule(key)}
                className={`p-4 bg-white rounded-xl shadow-lg border-2 border-transparent hover:border-${module.color}-300 transition-all`}
              >
                <IconComponent className={`text-${module.color}-500 mx-auto mb-2`} size={24} />
                <div className="text-sm font-medium text-gray-800">{module.name}</div>
              </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mind Balance Hub</h1>
          <p className="text-gray-600">Scientifically-backed tools to restore mental equilibrium</p>
        </motion.div>

        {/* Module Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {Object.entries(modules).map(([key, module]) => {
            const IconComponent = module.icon
            return (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveModule(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                  activeModule === key
                    ? `border-${module.color}-400 bg-${module.color}-50 text-${module.color}-700`
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <IconComponent size={20} />
                <span className="font-medium">{module.name}</span>
              </motion.button>
            )
          })}
        </div>

        {/* Module Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeModule === 'overview' && <OverviewModule />}
            {activeModule === 'tracker' && (
              <MindBalanceTracker onSessionComplete={handleSessionComplete} />
            )}
            {activeModule === 'breathing' && (
              <div className="max-w-2xl mx-auto">
                <BreathingCoherence 
                  onComplete={(data) => handleSessionComplete({ ...data, type: 'breathing' })}
                  isActive={true}
                />
              </div>
            )}
            {activeModule === 'cognitive' && (
              <CognitiveBalanceExercises 
                onComplete={(data) => handleSessionComplete({ ...data, type: 'cognitive' })}
              />
            )}
            {activeModule === 'dopamine' && (
              <div className="bg-white rounded-xl p-8 shadow-lg text-center">
                <Zap className="text-yellow-500 mx-auto mb-4" size={48} />
                <h2 className="text-2xl font-bold mb-4">Dopamine Reset Module</h2>
                <p className="text-gray-600 mb-6">
                  This module is integrated into the full Balance Tracker. 
                  Click "Balance Tracker" to access dopamine management tools.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveModule('tracker')}
                  className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium"
                >
                  Go to Balance Tracker
                </motion.button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Progress Summary */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20"
        >
          <div className="text-center">
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-2xl font-bold text-indigo-600">{userProgress.totalSessions}</div>
                <div className="text-sm text-gray-600">Total Sessions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{userProgress.streakDays}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{userProgress.achievements.length}</div>
                <div className="text-sm text-gray-600">Achievements</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default MindBalance
