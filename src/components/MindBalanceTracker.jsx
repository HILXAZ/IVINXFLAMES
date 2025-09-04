import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, Heart, Zap, Moon, Sun, Activity, Target, TrendingUp, 
  Waves, Timer, BarChart3, Calendar, CheckCircle, AlertTriangle,
  Wind, Flower2, Sparkles, Shield, Battery
} from 'lucide-react'

// Core Mind Balance Tracker with Dopamine Reset & Urge Surfing
const MindBalanceTracker = () => {
  // Core State Management
  const [balanceData, setBalanceData] = useState(() => {
    const saved = localStorage.getItem('mind_balance_data')
    return saved ? JSON.parse(saved) : {
      dopamineLoad: 3, // 0-10 scale
      stressLevel: 5,   // 0-10 scale
      rewardActivities: 0, // daily count
      urges: [],
      balanceScore: 50,
      circadianStability: 70,
      lastUpdate: Date.now()
    }
  })

  const [activeFeature, setActiveFeature] = useState('dashboard')
  const [urgeSurfingActive, setUrgeSurfingActive] = useState(false)
  const [breathingSession, setBreathingSession] = useState(false)
  const [dailyCheckIn, setDailyCheckIn] = useState(false)

  // Urge Surfing State
  const [urgeIntensity, setUrgeIntensity] = useState(0)
  const [surfingPhase, setSurfingPhase] = useState('notice') // notice, accept, breathe, release
  const [surfingTimer, setSurfingTimer] = useState(0)

  // Breathing Coherence State
  const [breathingPhase, setBreathingPhase] = useState('inhale') // inhale, hold, exhale, pause
  const [breathingCount, setBreathingCount] = useState(0)
  const [coherenceScore, setCoherenceScore] = useState(0)

  // Mind-Body Check-in State
  const [mindState, setMindState] = useState('')
  const [bodyState, setBodyState] = useState('')
  const [energyLevel, setEnergyLevel] = useState(5)

  const intervalRef = useRef(null)

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('mind_balance_data', JSON.stringify(balanceData))
  }, [balanceData])

  // Calculate overall balance score
  const calculateBalanceScore = () => {
    const stressBalance = Math.max(0, 10 - balanceData.stressLevel) * 10
    const dopamineBalance = (5 - Math.abs(balanceData.dopamineLoad - 5)) * 10
    const rewardBalance = Math.min(balanceData.rewardActivities * 20, 100)
    const circadianBalance = balanceData.circadianStability
    
    return Math.round((stressBalance + dopamineBalance + rewardBalance + circadianBalance) / 4)
  }

  // Dopamine Reset Planner
  const DopamineResetPlanner = () => {
    const lowDopamineActivities = [
      { name: "5-min nature walk", duration: 5, reward: "grounding" },
      { name: "Gratitude journaling", duration: 3, reward: "serotonin boost" },
      { name: "Deep breathing", duration: 2, reward: "calm focus" },
      { name: "Stretch & movement", duration: 5, reward: "body awareness" },
      { name: "Hydrate mindfully", duration: 1, reward: "reset moment" }
    ]

    const getDopamineStatus = () => {
      if (balanceData.dopamineLoad < 3) return { status: "Low", color: "blue", action: "Safe to engage" }
      if (balanceData.dopamineLoad < 7) return { status: "Balanced", color: "green", action: "Maintain current level" }
      return { status: "Overloaded", color: "red", action: "Reset recommended" }
    }

    const dopamineStatus = getDopamineStatus()

    return (
      <div className="space-y-6">
        {/* Dopamine Load Bar */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="text-yellow-500" size={24} />
            <h3 className="text-xl font-bold">Dopamine Load Monitor</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Load</span>
              <span className={`text-sm font-bold text-${dopamineStatus.color}-600`}>
                {dopamineStatus.status}
              </span>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <motion.div 
                  className={`h-4 rounded-full bg-gradient-to-r ${
                    balanceData.dopamineLoad < 3 ? 'from-blue-400 to-blue-600' :
                    balanceData.dopamineLoad < 7 ? 'from-green-400 to-green-600' :
                    'from-red-400 to-red-600'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${balanceData.dopamineLoad * 10}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>Balanced</span>
                <span>Overload</span>
              </div>
            </div>
            
            <div className={`p-3 rounded-lg bg-${dopamineStatus.color}-50 border border-${dopamineStatus.color}-200`}>
              <p className={`text-sm text-${dopamineStatus.color}-800`}>
                <strong>Recommendation:</strong> {dopamineStatus.action}
              </p>
            </div>
          </div>
        </div>

        {/* Reset Activities */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Flower2 className="text-purple-500" size={20} />
            Low-Dopamine Reset Activities
          </h4>
          
          <div className="grid gap-3">
            {lowDopamineActivities.map((activity, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setBalanceData(prev => ({
                    ...prev,
                    rewardActivities: prev.rewardActivities + 1,
                    dopamineLoad: Math.max(0, prev.dopamineLoad - 0.5)
                  }))
                }}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
              >
                <div className="text-left">
                  <div className="font-medium">{activity.name}</div>
                  <div className="text-sm text-gray-600">{activity.duration} min • {activity.reward}</div>
                </div>
                <CheckCircle className="text-purple-500" size={20} />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Urge Surfing Assistant
  const UrgeSurfingAssistant = () => {
    const startUrgeSurfing = (intensity) => {
      setUrgeIntensity(intensity)
      setUrgeSurfingActive(true)
      setSurfingPhase('notice')
      setSurfingTimer(0)
      
      // Start the surfing sequence
      const sequence = [
        { phase: 'notice', duration: 30, instruction: "Notice the urge without judgment" },
        { phase: 'accept', duration: 60, instruction: "Accept that this feeling will pass" },
        { phase: 'breathe', duration: 120, instruction: "Breathe deeply and observe sensations" },
        { phase: 'release', duration: 30, instruction: "Feel the urge naturally fading" }
      ]
      
      let currentStep = 0
      intervalRef.current = setInterval(() => {
        setSurfingTimer(prev => prev + 1)
        if (currentStep < sequence.length - 1 && surfingTimer >= sequence[currentStep].duration) {
          currentStep++
          setSurfingPhase(sequence[currentStep].phase)
          setSurfingTimer(0)
        } else if (currentStep === sequence.length - 1 && surfingTimer >= sequence[currentStep].duration) {
          completeUrgeSurfing()
        }
      }, 1000)
    }

    const completeUrgeSurfing = () => {
      clearInterval(intervalRef.current)
      setUrgeSurfingActive(false)
      
      // Log the urge event
      const urgeEvent = {
        id: Date.now(),
        intensity: urgeIntensity,
        timestamp: new Date().toISOString(),
        surfed: true,
        duration: 240 // total surfing time
      }
      
      setBalanceData(prev => ({
        ...prev,
        urges: [...prev.urges, urgeEvent],
        stressLevel: Math.max(0, prev.stressLevel - 1)
      }))
    }

    if (urgeSurfingActive) {
      const getPhaseInfo = () => {
        switch(surfingPhase) {
          case 'notice':
            return { 
              title: "Notice the Urge", 
              instruction: "Acknowledge the craving without fighting it",
              color: "blue",
              icon: Brain
            }
          case 'accept':
            return { 
              title: "Accept & Allow", 
              instruction: "This feeling is temporary and will pass",
              color: "green", 
              icon: Heart
            }
          case 'breathe':
            return { 
              title: "Breathe & Observe", 
              instruction: "Notice sensations in your body as you breathe",
              color: "purple",
              icon: Wind
            }
          case 'release':
            return { 
              title: "Release & Let Go", 
              instruction: "Feel the urge naturally fading away",
              color: "indigo",
              icon: Sparkles
            }
        }
      }

      const phaseInfo = getPhaseInfo()
      const IconComponent = phaseInfo.icon

      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center"
          >
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-${phaseInfo.color}-100 flex items-center justify-center`}>
              <IconComponent className={`text-${phaseInfo.color}-600`} size={32} />
            </div>
            
            <h3 className="text-2xl font-bold mb-2">{phaseInfo.title}</h3>
            <p className="text-gray-600 mb-6">{phaseInfo.instruction}</p>
            
            {/* Breathing Circle */}
            <motion.div 
              className={`w-32 h-32 mx-auto mb-6 rounded-full border-4 border-${phaseInfo.color}-300`}
              animate={{ 
                scale: surfingPhase === 'breathe' ? [1, 1.2, 1] : 1,
                borderColor: surfingPhase === 'breathe' ? [`var(--${phaseInfo.color}-300)`, `var(--${phaseInfo.color}-500)`, `var(--${phaseInfo.color}-300)`] : undefined
              }}
              transition={{ 
                duration: 4, 
                repeat: surfingPhase === 'breathe' ? Infinity : 0,
                ease: "easeInOut"
              }}
            />
            
            <div className="text-lg font-medium mb-4">
              Timer: {Math.floor(surfingTimer / 60)}:{(surfingTimer % 60).toString().padStart(2, '0')}
            </div>
            
            <button
              onClick={completeUrgeSurfing}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Complete Session
            </button>
          </motion.div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Waves className="text-blue-500" size={24} />
            <h3 className="text-xl font-bold">Urge Surfing Assistant</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            When you feel an urge, use this mindfulness technique to "surf the wave" instead of fighting it.
          </p>
          
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700 mb-2">How intense is your urge right now?</div>
            {[
              { level: 3, label: "Mild", color: "green" },
              { level: 6, label: "Moderate", color: "yellow" },
              { level: 9, label: "Strong", color: "red" }
            ].map(({ level, label, color }) => (
              <motion.button
                key={level}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startUrgeSurfing(level)}
                className={`w-full p-4 border-2 border-${color}-200 bg-${color}-50 hover:bg-${color}-100 rounded-lg text-left transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{label} Urge</div>
                    <div className="text-sm text-gray-600">Intensity: {level}/10</div>
                  </div>
                  <Waves className={`text-${color}-500`} size={20} />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Urge History */}
        {balanceData.urges.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h4 className="text-lg font-bold mb-4">Recent Urge Surfing Sessions</h4>
            <div className="space-y-3">
              {balanceData.urges.slice(-5).map((urge) => (
                <div key={urge.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium">
                      {new Date(urge.timestamp).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">
                      Intensity: {urge.intensity}/10 • Duration: {Math.floor(urge.duration / 60)}m
                    </div>
                  </div>
                  {urge.surfed && <CheckCircle className="text-green-500" size={20} />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Stress-Reward Balance Tracker
  const StressRewardBalance = () => {
    const getBalanceStatus = () => {
      const ratio = balanceData.rewardActivities / Math.max(1, balanceData.stressLevel)
      if (ratio > 1) return { status: "Balanced", color: "green", message: "Great balance!" }
      if (ratio > 0.5) return { status: "Moderate", color: "yellow", message: "Could use more rewards" }
      return { status: "Imbalanced", color: "red", message: "High stress, low rewards" }
    }

    const balanceStatus = getBalanceStatus()

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="text-indigo-500" size={24} />
            <h3 className="text-xl font-bold">Stress-Reward Balance</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Stress Level */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Current Stress Level</label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={balanceData.stressLevel}
                  onChange={(e) => setBalanceData(prev => ({ ...prev, stressLevel: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Calm</span>
                  <span className="font-medium">{balanceData.stressLevel}/10</span>
                  <span>Overwhelmed</span>
                </div>
              </div>
            </div>

            {/* Reward Activities */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Reward Activities Today</label>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-green-600">{balanceData.rewardActivities}</div>
                <div className="text-sm text-gray-600">healthy rewards completed</div>
              </div>
            </div>
          </div>

          {/* Balance Indicator */}
          <div className={`mt-6 p-4 rounded-lg bg-${balanceStatus.color}-50 border border-${balanceStatus.color}-200`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full bg-${balanceStatus.color}-500`} />
              <div>
                <div className={`font-medium text-${balanceStatus.color}-800`}>
                  Balance Status: {balanceStatus.status}
                </div>
                <div className={`text-sm text-${balanceStatus.color}-700`}>
                  {balanceStatus.message}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Mind-Body Check-In
  const MindBodyCheckIn = () => {
    const mindOptions = [
      { state: 'calm', emoji: '😌', color: 'green' },
      { state: 'focused', emoji: '🎯', color: 'blue' },
      { state: 'restless', emoji: '😟', color: 'yellow' },
      { state: 'stressed', emoji: '😰', color: 'red' },
      { state: 'overwhelmed', emoji: '🤯', color: 'purple' }
    ]

    const bodyOptions = [
      { state: 'relaxed', emoji: '😊', color: 'green' },
      { state: 'energetic', emoji: '⚡', color: 'blue' },
      { state: 'tired', emoji: '😴', color: 'gray' },
      { state: 'tense', emoji: '😬', color: 'yellow' },
      { state: 'achy', emoji: '🤕', color: 'red' }
    ]

    const submitCheckIn = () => {
      const checkIn = {
        timestamp: new Date().toISOString(),
        mind: mindState,
        body: bodyState,
        energy: energyLevel
      }
      
      // Save check-in data (you could expand this to store history)
      console.log('Check-in submitted:', checkIn)
      setDailyCheckIn(false)
      
      // Update balance based on check-in
      let stressAdjustment = 0
      if (mindState === 'stressed' || mindState === 'overwhelmed') stressAdjustment += 1
      if (bodyState === 'tense' || bodyState === 'achy') stressAdjustment += 1
      if (energyLevel < 4) stressAdjustment += 1
      
      setBalanceData(prev => ({
        ...prev,
        stressLevel: Math.min(10, prev.stressLevel + stressAdjustment - 1)
      }))
    }

    if (dailyCheckIn) {
      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md mx-4"
          >
            <h3 className="text-2xl font-bold mb-6 text-center">Mind-Body Check-In</h3>
            
            {/* Mind State */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-3 block">How is your mind?</label>
              <div className="grid grid-cols-5 gap-2">
                {mindOptions.map((option) => (
                  <button
                    key={option.state}
                    onClick={() => setMindState(option.state)}
                    className={`p-3 rounded-lg text-center transition-all ${
                      mindState === option.state 
                        ? `bg-${option.color}-100 border-2 border-${option.color}-400` 
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-xs font-medium">{option.state}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Body State */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-3 block">How is your body?</label>
              <div className="grid grid-cols-5 gap-2">
                {bodyOptions.map((option) => (
                  <button
                    key={option.state}
                    onClick={() => setBodyState(option.state)}
                    className={`p-3 rounded-lg text-center transition-all ${
                      bodyState === option.state 
                        ? `bg-${option.color}-100 border-2 border-${option.color}-400` 
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-xs font-medium">{option.state}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Level */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-3 block">Energy Level</label>
              <input
                type="range"
                min="1"
                max="10"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Drained</span>
                <span className="font-medium">{energyLevel}/10</span>
                <span>Energized</span>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                onClick={() => setDailyCheckIn(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={submitCheckIn}
                disabled={!mindState || !bodyState}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete Check-In
              </button>
            </div>
          </motion.div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="text-pink-500" size={24} />
            <h3 className="text-xl font-bold">Mind-Body Check-In</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            Regular check-ins help you notice patterns and maintain balance between mental and physical states.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDailyCheckIn(true)}
            className="w-full p-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium"
          >
            Start Check-In
          </motion.button>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mind Balance Tracker</h1>
          <p className="text-gray-600">Restore balance between stress & reward systems</p>
        </motion.div>

        {/* Balance Score Display */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-6 shadow-xl mb-8"
        >
          <div className="text-center">
            <div className="text-6xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text mb-2">
              {calculateBalanceScore()}%
            </div>
            <div className="text-xl font-medium text-gray-700 mb-4">Overall Mind Balance</div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{10 - balanceData.stressLevel}/10</div>
                <div className="text-sm text-gray-600">Stress Management</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{balanceData.rewardActivities}</div>
                <div className="text-sm text-gray-600">Reward Activities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{balanceData.dopamineLoad}/10</div>
                <div className="text-sm text-gray-600">Dopamine Load</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{balanceData.circadianStability}%</div>
                <div className="text-sm text-gray-600">Sleep Rhythm</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { id: 'dopamine', label: 'Dopamine Reset', icon: Zap, color: 'yellow' },
            { id: 'urge-surfing', label: 'Urge Surfing', icon: Waves, color: 'blue' },
            { id: 'balance', label: 'Stress-Reward', icon: BarChart3, color: 'indigo' },
            { id: 'checkin', label: 'Mind-Body', icon: Heart, color: 'pink' }
          ].map((feature) => {
            const IconComponent = feature.icon
            return (
              <motion.button
                key={feature.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFeature(feature.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  activeFeature === feature.id
                    ? `border-${feature.color}-400 bg-${feature.color}-50`
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <IconComponent 
                  className={`mx-auto mb-2 ${
                    activeFeature === feature.id ? `text-${feature.color}-600` : 'text-gray-500'
                  }`} 
                  size={24} 
                />
                <div className={`text-sm font-medium ${
                  activeFeature === feature.id ? `text-${feature.color}-800` : 'text-gray-700'
                }`}>
                  {feature.label}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Active Feature Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFeature}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeFeature === 'dopamine' && <DopamineResetPlanner />}
            {activeFeature === 'urge-surfing' && <UrgeSurfingAssistant />}
            {activeFeature === 'balance' && <StressRewardBalance />}
            {activeFeature === 'checkin' && <MindBodyCheckIn />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default MindBalanceTracker
