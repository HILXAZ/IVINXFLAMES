                                                                                                                                                                            import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpring, animated } from 'react-spring'
import { useTimer } from 'react-timer-hook'
import { Howl } from 'howler'
import { 
  Heart, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  MessageCircle,
  Activity,
  Wind,
  StretchHorizontal,
  X,
  CheckCircle
} from 'lucide-react'

// Chinese color palette
const chineseColors = {
  primary: '#DC143C',
  secondary: '#FFD700', 
  accent: '#1C1C1C',
  jade: '#00A86B',
  ink: '#2C3E50',
  calm: '#87CEEB'
}

// Breathing Circle Animation Component
const BreathingCircle = ({ isActive, phase, breathingRate }) => {
  const springProps = useSpring({
    r: phase === 'inhale' ? 120 : 60,
    opacity: phase === 'inhale' ? 0.8 : 0.4,
    config: { duration: breathingRate * 1000 }
  })

  return (
    <div className="flex items-center justify-center">
      <svg width="300" height="300" className="relative">
        {/* Outer guide circle */}
        <circle 
          cx="150" 
          cy="150" 
          r="120" 
          fill="none" 
          stroke={chineseColors.jade} 
          strokeWidth="2" 
          opacity="0.3"
        />
        {/* Breathing circle */}
        <animated.circle 
          cx="150" 
          cy="150" 
          r={springProps.r}
          fill={chineseColors.calm}
          opacity={springProps.opacity}
        />
        {/* Center dot */}
        <circle 
          cx="150" 
          cy="150" 
          r="8" 
          fill={chineseColors.primary}
        />
      </svg>
      
      {/* Instruction text overlay */}
      <div className="absolute text-center">
        <motion.div
          key={phase}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="text-2xl font-bold"
          style={{ color: chineseColors.primary }}
        >
          {phase === 'inhale' ? '吸气 (Inhale)' : '呼气 (Exhale)'}
        </motion.div>
        <div className="text-lg mt-2" style={{ color: chineseColors.ink }}>
          {phase === 'inhale' ? '缓慢深呼吸' : '慢慢释放'}
        </div>
      </div>
    </div>
  )
}

// Stretching Exercise Component
const StretchingExercise = ({ exercise, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isHolding, setIsHolding] = useState(false)
  
  const expiryTimestamp = new Date()
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + exercise.duration)
  
  const { seconds, start, pause, resume, isRunning } = useTimer({
    expiryTimestamp,
    onExpire: () => {
      setIsHolding(false)
      if (currentStep < exercise.steps.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        onComplete()
      }
    }
  })

  const startHold = () => {
    setIsHolding(true)
    start()
  }

  const currentStepData = exercise.steps[currentStep]

  return (
    <div className="text-center space-y-6">
      {/* Exercise illustration */}
      <div className="w-64 h-64 mx-auto bg-gradient-to-br from-blue-100 to-green-100 rounded-3xl flex items-center justify-center">
        <div className="text-6xl">{currentStepData.icon}</div>
      </div>
      
      {/* Exercise name and instructions */}
      <div>
        <h3 className="text-2xl font-bold mb-2" style={{ color: chineseColors.primary }}>
          {currentStepData.name}
        </h3>
        <p className="text-lg mb-4" style={{ color: chineseColors.ink }}>
          {currentStepData.description}
        </p>
        
        {/* Progress indicator */}
        <div className="flex justify-center space-x-2 mb-4">
          {exercise.steps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentStep ? 'bg-red-500' : 
                index < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Timer and controls */}
      {isHolding ? (
        <div className="space-y-4">
          <div className="text-4xl font-bold" style={{ color: chineseColors.primary }}>
            {seconds}s
          </div>
          <div className="text-lg">保持姿势 (Hold the position)</div>
          <button
            onClick={isRunning ? pause : resume}
            className="px-6 py-3 rounded-xl text-white font-bold"
            style={{ backgroundColor: chineseColors.primary }}
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
        </div>
      ) : (
        <button
          onClick={startHold}
          className="px-8 py-4 rounded-xl text-white text-xl font-bold"
          style={{ backgroundColor: chineseColors.jade }}
        >
          开始 {currentStepData.duration}秒 (Start {currentStepData.duration}s)
        </button>
      )}
    </div>
  )
}

// Voice Chat Component
const VoiceChat = ({ onClose }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [messages, setMessages] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const vapiRef = useRef(null)
  
  // Mock Vapi integration (replace with actual Vapi when API keys are available)
  const startVoiceChat = async () => {
    setIsConnected(true)
    setMessages([
      {
        role: 'assistant',
        content: '你好！我是你的康复助手。告诉我你现在的感受，我来帮助你度过这个困难时刻。(Hello! I\'m your recovery assistant. Tell me how you\'re feeling right now, and I\'ll help you through this difficult moment.)',
        timestamp: Date.now()
      }
    ])
  }

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true)
      // Start recording logic would go here
      setTimeout(() => {
        setIsRecording(false)
        // Simulate user message
        setMessages(prev => [...prev, {
          role: 'user',
          content: '我感到很焦虑，想要放弃 (I feel very anxious and want to give up)',
          timestamp: Date.now()
        }])
        
        // Simulate AI response
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant', 
            content: '我理解你的感受。焦虑是正常的，让我们一起做一个简单的呼吸练习来平静心情。记住，每一次选择坚持都是胜利。(I understand how you feel. Anxiety is normal. Let\'s do a simple breathing exercise together to calm your mind. Remember, every choice to persevere is a victory.)',
            timestamp: Date.now()
          }])
        }, 2000)
      }, 3000)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-xl font-bold" style={{ color: chineseColors.primary }}>
          AI 康复助手 (AI Recovery Assistant)
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Controls */}
      <div className="p-4 border-t">
        {!isConnected ? (
          <button
            onClick={startVoiceChat}
            className="w-full py-3 rounded-xl text-white font-bold"
            style={{ backgroundColor: chineseColors.primary }}
          >
            开始语音对话 (Start Voice Chat)
          </button>
        ) : (
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={toggleRecording}
              className={`p-4 rounded-full text-white transition-all ${
                isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
              }`}
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
            <span className="text-sm text-gray-600">
              {isRecording ? '正在聆听... (Listening...)' : '点击说话 (Tap to speak)'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// Main Lapse Rescue Mode Component
const LapseRescueMode = ({ isOpen, onClose }) => {
  const [currentMode, setCurrentMode] = useState('menu') // menu, breathing, stretching, voice
  const [breathingPhase, setBreathingPhase] = useState('inhale')
  const [breathingActive, setBreathingActive] = useState(false)
  const [breathingRate, setBreathingRate] = useState(4) // seconds per phase
  const [completedExercises, setCompletedExercises] = useState([])

  // Breathing exercise timer
  useEffect(() => {
    if (!breathingActive) return
    
    const interval = setInterval(() => {
      setBreathingPhase(prev => prev === 'inhale' ? 'exhale' : 'inhale')
    }, breathingRate * 1000)
    
    return () => clearInterval(interval)
  }, [breathingActive, breathingRate])

  // Sample stretching exercises
  const stretchingExercises = [
    {
      id: 1,
      name: '颈部伸展 (Neck Stretch)',
      duration: 15,
      steps: [
        {
          name: '颈部左转 (Neck Left Turn)',
          description: '慢慢将头转向左侧，感受右侧颈部的拉伸',
          icon: '↺',
          duration: 15
        },
        {
          name: '颈部右转 (Neck Right Turn)', 
          description: '慢慢将头转向右侧，感受左侧颈部的拉伸',
          icon: '↻',
          duration: 15
        }
      ]
    },
    {
      id: 2,
      name: '肩部舒展 (Shoulder Rolls)',
      duration: 20,
      steps: [
        {
          name: '向前转动 (Forward Rolls)',
          description: '肩膀向前画圆，缓解肩部紧张',
          icon: '🔄',
          duration: 20
        },
        {
          name: '向后转动 (Backward Rolls)',
          description: '肩膀向后画圆，打开胸腔',
          icon: '🔄',
          duration: 20
        }
      ]
    }
  ]

  const startBreathing = () => {
    setBreathingActive(true)
    setCurrentMode('breathing')
  }

  const stopBreathing = () => {
    setBreathingActive(false)
    setCurrentMode('menu')
  }

  const startStretching = () => {
    setCurrentMode('stretching')
  }

  const startVoiceChat = () => {
    setCurrentMode('voice')
  }

  const handleStretchingComplete = () => {
    setCompletedExercises(prev => [...prev, 'stretching'])
    setCurrentMode('menu')
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-2xl h-5/6 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-yellow-500 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">康复救援模式</h2>
              <p className="text-lg opacity-90">Lapse Rescue Mode</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 h-full overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentMode === 'menu' && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: chineseColors.primary }}>
                    选择你的救援活动 (Choose Your Rescue Activity)
                  </h3>
                  <p className="text-lg text-gray-600">
                    让我们一起度过这个困难时刻 (Let's get through this difficult moment together)
                  </p>
                </div>

                {/* Activity Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Breathing Exercise */}
                  <motion.button
                    onClick={startBreathing}
                    className="p-6 rounded-2xl border-2 border-gray-200 hover:border-blue-400 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Wind className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                    <h4 className="text-xl font-bold mb-2">呼吸练习</h4>
                    <p className="text-sm text-gray-600">Breathing Exercise</p>
                    <p className="text-sm text-gray-500 mt-2">
                      引导呼吸平静心情 (Guided breathing to calm your mind)
                    </p>
                  </motion.button>

                  {/* Stretching */}
                  <motion.button
                    onClick={startStretching}
                    className="p-6 rounded-2xl border-2 border-gray-200 hover:border-green-400 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <StretchHorizontal className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <h4 className="text-xl font-bold mb-2">拉伸运动</h4>
                    <p className="text-sm text-gray-600">Stretching Exercises</p>
                    <p className="text-sm text-gray-500 mt-2">
                      缓解身体紧张 (Relieve physical tension)
                    </p>
                  </motion.button>

                  {/* Voice Chat */}
                  <motion.button
                    onClick={startVoiceChat}
                    className="p-6 rounded-2xl border-2 border-gray-200 hover:border-purple-400 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                    <h4 className="text-xl font-bold mb-2">AI 对话</h4>
                    <p className="text-sm text-gray-600">AI Conversation</p>
                    <p className="text-sm text-gray-500 mt-2">
                      与AI助手交流感受 (Talk with AI assistant about your feelings)
                    </p>
                  </motion.button>
                </div>

                {/* Completed exercises indicator */}
                {completedExercises.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 rounded-2xl p-4"
                  >
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <span className="font-semibold text-green-700">
                        太棒了！你已经完成了 {completedExercises.length} 个练习 
                        (Great! You've completed {completedExercises.length} exercise{completedExercises.length > 1 ? 's' : ''})
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {currentMode === 'breathing' && (
              <motion.div
                key="breathing"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="text-center space-y-8"
              >
                <div>
                  <button
                    onClick={() => setCurrentMode('menu')}
                    className="mb-4 text-blue-500 hover:text-blue-700 flex items-center"
                  >
                    ← 返回菜单 (Back to Menu)
                  </button>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: chineseColors.primary }}>
                    深呼吸练习 (Deep Breathing Exercise)
                  </h3>
                  <p className="text-lg text-gray-600">
                    跟随圆圈的节奏，深呼吸放松 (Follow the circle's rhythm, breathe deeply and relax)
                  </p>
                </div>

                <BreathingCircle 
                  isActive={breathingActive}
                  phase={breathingPhase}
                  breathingRate={breathingRate}
                />

                <div className="space-y-4">
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setBreathingActive(!breathingActive)}
                      className="px-6 py-3 rounded-xl text-white font-bold flex items-center space-x-2"
                      style={{ backgroundColor: breathingActive ? chineseColors.primary : chineseColors.jade }}
                    >
                      {breathingActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      <span>{breathingActive ? '暂停 (Pause)' : '开始 (Start)'}</span>
                    </button>
                  </div>

                  <div className="flex justify-center items-center space-x-4">
                    <span className="text-sm">节奏 (Rhythm):</span>
                    <button
                      onClick={() => setBreathingRate(Math.max(2, breathingRate - 1))}
                      className="px-3 py-1 bg-gray-200 rounded"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 bg-gray-100 rounded">{breathingRate}s</span>
                    <button
                      onClick={() => setBreathingRate(Math.min(8, breathingRate + 1))}
                      className="px-3 py-1 bg-gray-200 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentMode === 'stretching' && (
              <motion.div
                key="stretching"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <button
                  onClick={() => setCurrentMode('menu')}
                  className="mb-4 text-blue-500 hover:text-blue-700 flex items-center"
                >
                  ← 返回菜单 (Back to Menu)
                </button>
                
                <StretchingExercise
                  exercise={stretchingExercises[0]}
                  onComplete={handleStretchingComplete}
                />
              </motion.div>
            )}

            {currentMode === 'voice' && (
              <motion.div
                key="voice"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full"
              >
                <VoiceChat onClose={() => setCurrentMode('menu')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default LapseRescueMode
