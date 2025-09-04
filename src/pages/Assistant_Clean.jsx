import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Send, Mic, Square, Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import OppenheimerBackground from '../components/OppenheimerBackground'

// Enhanced AI Avatar Component with Ultra-Realistic Features
const AnimatedAvatar = ({ speaking, listening }) => {
  const [avatarMode, setAvatarMode] = useState('realistic') // 'realistic', 'robot', 'hologram'
  const [eyeState, setEyeState] = useState('normal')
  const [mouthState, setMouthState] = useState('closed')
  
  // Advanced blinking animation
  useEffect(() => {
    const naturalBlink = () => {
      setEyeState('blink')
      setTimeout(() => setEyeState('normal'), 120)
      
      // Random next blink between 2-5 seconds
      const nextBlink = 2000 + Math.random() * 3000
      setTimeout(naturalBlink, nextBlink)
    }
    
    const timer = setTimeout(naturalBlink, 1000)
    return () => clearTimeout(timer)
  }, [])
  
  // Enhanced speaking animation with realistic mouth movements
  useEffect(() => {
    if (speaking) {
      const speechPatterns = ['ah', 'oh', 'eh', 'closed', 'wide', 'small']
      let patternIndex = 0
      
      const animateSpeech = () => {
        setMouthState(speechPatterns[patternIndex])
        patternIndex = (patternIndex + 1) % speechPatterns.length
      }
      
      // Vary timing for natural speech rhythm
      const speechInterval = setInterval(animateSpeech, 140 + Math.random() * 60)
      return () => clearInterval(speechInterval)
    } else {
      setMouthState('closed')
    }
  }, [speaking])
  
  const avatarStyles = {
    realistic: {
      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #f59e0b 100%)',
      border: '3px solid #d97706',
      shadow: speaking ? '0 0 30px rgba(251, 191, 36, 0.6)' : listening ? '0 0 25px rgba(16, 185, 129, 0.5)' : '0 0 20px rgba(107, 114, 128, 0.3)'
    },
    robot: {
      background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #64748b 100%)',
      border: '3px solid #475569',
      shadow: speaking ? '0 0 30px rgba(59, 130, 246, 0.6)' : listening ? '0 0 25px rgba(34, 197, 94, 0.5)' : '0 0 20px rgba(148, 163, 184, 0.4)'
    },
    hologram: {
      background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(14, 165, 233, 0.3) 50%, rgba(59, 130, 246, 0.4) 100%)',
      border: '3px solid rgba(59, 130, 246, 0.8)',
      shadow: speaking ? '0 0 40px rgba(59, 130, 246, 0.8)' : listening ? '0 0 30px rgba(16, 185, 129, 0.6)' : '0 0 25px rgba(99, 102, 241, 0.5)'
    }
  }
  
  const currentStyle = avatarStyles[avatarMode]
  
  return (
    <motion.div 
      className="relative w-32 h-32 mx-auto rounded-full overflow-hidden cursor-pointer"
      style={{
        background: currentStyle.background,
        border: currentStyle.border,
        boxShadow: currentStyle.shadow
      }}
      animate={{
        scale: speaking ? [1, 1.08, 1] : listening ? [1, 1.04, 1] : 1,
        rotate: speaking ? [-1, 1, -1] : 0
      }}
      transition={{
        scale: { duration: 0.3, repeat: speaking ? Infinity : 0 },
        rotate: { duration: 0.4, repeat: speaking ? Infinity : 0 }
      }}
      onClick={() => {
        const modes = ['realistic', 'robot', 'hologram']
        const currentIndex = modes.indexOf(avatarMode)
        setAvatarMode(modes[(currentIndex + 1) % modes.length])
      }}
    >
      {/* Avatar Content based on mode */}
      {avatarMode === 'realistic' && (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Realistic Human-like Face */}
          <div className="relative w-28 h-28 bg-gradient-to-br from-amber-100 to-orange-200 rounded-full shadow-inner border-2 border-orange-300">
            
            {/* Hair */}
            <div className="absolute -top-2 -left-2 -right-2 h-16 bg-gradient-to-br from-amber-800 via-yellow-700 to-amber-900 rounded-t-full">
              <div className="absolute inset-2 bg-gradient-to-r from-amber-700/30 to-yellow-600/30 rounded-t-full" />
            </div>
            
            {/* Face */}
            <div className="absolute top-12 inset-x-2 bottom-2 rounded-full bg-gradient-to-br from-amber-50 via-orange-100 to-amber-200 shadow-inner">
              
              {/* Eyes */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                <motion.div 
                  className="w-4 h-4 bg-white rounded-full shadow-lg border border-gray-200"
                  animate={{ scaleY: eyeState === 'blink' ? 0.1 : 1 }}
                  transition={{ duration: 0.12 }}
                >
                  <div className="absolute inset-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
                    <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-black rounded-full">
                      <div className="absolute top-0 left-0 w-1 h-1 bg-white rounded-full opacity-90" />
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="w-4 h-4 bg-white rounded-full shadow-lg border border-gray-200"
                  animate={{ scaleY: eyeState === 'blink' ? 0.1 : 1 }}
                  transition={{ duration: 0.12 }}
                >
                  <div className="absolute inset-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
                    <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-black rounded-full">
                      <div className="absolute top-0 left-0 w-1 h-1 bg-white rounded-full opacity-90" />
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Eyebrows */}
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex gap-4">
                <div className="w-4 h-1 bg-amber-800 rounded-full" />
                <div className="w-4 h-1 bg-amber-800 rounded-full" />
              </div>
              
              {/* Nose */}
              <div className="absolute top-7 left-1/2 transform -translate-x-1/2 w-2 h-3 bg-gradient-to-b from-orange-200 to-amber-300 rounded-full shadow-sm" />
              
              {/* Mouth with realistic speaking animation */}
              <motion.div 
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                animate={{
                  scaleX: speaking ? [1, 1.3, 1] : 1,
                  scaleY: speaking ? [1, 1.2, 1] : 1
                }}
                transition={{ duration: 0.15, repeat: speaking ? Infinity : 0 }}
              >
                <div className={`
                  bg-gradient-to-b from-red-400 to-red-500 shadow-inner border border-red-300 transition-all duration-100
                  ${mouthState === 'closed' ? 'w-4 h-1 rounded-full' :
                    mouthState === 'small' ? 'w-3 h-2 rounded-full' :
                    mouthState === 'wide' ? 'w-6 h-2 rounded-full' :
                    mouthState === 'ah' ? 'w-4 h-4 rounded-full' :
                    mouthState === 'oh' ? 'w-3 h-4 rounded-full' :
                    mouthState === 'eh' ? 'w-5 h-2 rounded-full' :
                    'w-4 h-1 rounded-full'
                  }
                `}>
                  {/* Teeth for wider mouth states */}
                  {(mouthState === 'wide' || mouthState === 'ah' || mouthState === 'eh') && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-white rounded-t-full opacity-80" />
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}
      
      {avatarMode === 'robot' && (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Robotic AI Face */}
          <div className="relative w-28 h-28 bg-gradient-to-br from-slate-300 to-slate-500 rounded-2xl shadow-inner border-2 border-slate-600">
            
            {/* Robot Head Top */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-gradient-to-b from-blue-500 to-blue-600 rounded-t-lg">
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            </div>
            
            {/* Digital Display Eyes */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex gap-2">
              <motion.div 
                className="w-5 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded border border-blue-600 flex items-center justify-center"
                animate={{ 
                  opacity: eyeState === 'blink' ? 0.3 : 1,
                  scaleY: eyeState === 'blink' ? 0.2 : 1 
                }}
                transition={{ duration: 0.1 }}
              >
                <div className="w-2 h-2 bg-white rounded-full" />
              </motion.div>
              
              <motion.div 
                className="w-5 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded border border-blue-600 flex items-center justify-center"
                animate={{ 
                  opacity: eyeState === 'blink' ? 0.3 : 1,
                  scaleY: eyeState === 'blink' ? 0.2 : 1 
                }}
                transition={{ duration: 0.1 }}
              >
                <div className="w-2 h-2 bg-white rounded-full" />
              </motion.div>
            </div>
            
            {/* Speaker Grille Mouth */}
            <motion.div 
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-slate-700 rounded border border-slate-800"
              animate={{
                boxShadow: speaking ? 
                  ['inset 0 0 5px #3b82f6', 'inset 0 0 10px #06b6d4', 'inset 0 0 5px #3b82f6'] :
                  'inset 0 0 3px #475569'
              }}
              transition={{ duration: 0.2, repeat: speaking ? Infinity : 0 }}
            >
              {/* Speaker lines */}
              <div className="absolute inset-1 flex flex-col gap-0.5">
                {[...Array(3)].map((_, i) => (
                  <motion.div 
                    key={i}
                    className="h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                    animate={{
                      opacity: speaking ? [0.3, 1, 0.3] : 0.5,
                      scaleX: speaking ? [0.8, 1.2, 0.8] : 1
                    }}
                    transition={{ 
                      duration: 0.3, 
                      repeat: speaking ? Infinity : 0,
                      delay: i * 0.1 
                    }}
                  />
                ))}
              </div>
            </motion.div>
            
            {/* Status LEDs */}
            <div className="absolute bottom-2 left-2 flex gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${listening ? 'bg-green-400' : 'bg-gray-400'}`} />
              <div className={`w-1.5 h-1.5 rounded-full ${speaking ? 'bg-blue-400' : 'bg-gray-400'}`} />
            </div>
          </div>
        </div>
      )}
      
      {avatarMode === 'hologram' && (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Holographic AI */}
          <motion.div 
            className="relative w-28 h-28 rounded-full border-2 border-cyan-400 bg-gradient-to-br from-cyan-100/20 to-blue-300/30 backdrop-blur-sm"
            animate={{
              borderColor: speaking ? ['#06b6d4', '#3b82f6', '#8b5cf6', '#06b6d4'] : ['#06b6d4', '#0ea5e9', '#06b6d4'],
              backgroundColor: speaking ? 
                ['rgba(6, 182, 212, 0.1)', 'rgba(59, 130, 246, 0.2)', 'rgba(139, 92, 246, 0.1)', 'rgba(6, 182, 212, 0.1)'] :
                ['rgba(6, 182, 212, 0.1)', 'rgba(14, 165, 233, 0.15)', 'rgba(6, 182, 212, 0.1)']
            }}
            transition={{ duration: speaking ? 1 : 2, repeat: Infinity }}
          >
            {/* Hologram Grid */}
            <div className="absolute inset-2 rounded-full border border-cyan-300/30 opacity-60" />
            <div className="absolute inset-4 rounded-full border border-cyan-300/20 opacity-40" />
            
            {/* Digital Avatar */}
            <div className="absolute inset-6 flex items-center justify-center">
              <motion.div 
                className="text-4xl"
                animate={{
                  scale: speaking ? [1, 1.2, 1] : [1, 1.05, 1],
                  rotate: speaking ? [0, 5, -5, 0] : 0,
                  filter: speaking ? 
                    ['hue-rotate(0deg)', 'hue-rotate(60deg)', 'hue-rotate(120deg)', 'hue-rotate(0deg)'] :
                    ['hue-rotate(0deg)', 'hue-rotate(30deg)', 'hue-rotate(0deg)']
                }}
                transition={{ 
                  duration: speaking ? 0.5 : 1.5, 
                  repeat: Infinity,
                  ease: speaking ? "easeInOut" : "easeInOut"
                }}
              >
                🤖
              </motion.div>
            </div>
            
            {/* Hologram Scan Lines */}
            <motion.div 
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, rgba(6, 182, 212, 0.2) 50%, transparent 100%)'
              }}
              animate={{
                y: [-100, 100, -100]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>
      )}
      
      {/* Enhanced Visual Effects */}
      <AnimatePresence>
        {speaking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -right-12 top-1/2 transform -translate-y-1/2"
          >
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-10 h-10 border-3 rounded-full"
                style={{
                  borderColor: avatarMode === 'robot' ? '#3b82f6' : 
                              avatarMode === 'hologram' ? '#06b6d4' : '#f59e0b',
                  borderStyle: 'solid',
                  borderWidth: '2px'
                }}
                animate={{
                  scale: [0, 2.5],
                  opacity: [0.8, 0],
                  rotate: [0, 180]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Listening Indicator */}
      <AnimatePresence>
        {listening && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -left-12 top-1/2 transform -translate-y-1/2"
          >
            <motion.div
              className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7],
                boxShadow: [
                  '0 0 0 0 rgba(16,185,129,0.7)', 
                  '0 0 0 10px rgba(16,185,129,0)', 
                  '0 0 0 0 rgba(16,185,129,0.7)'
                ]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mode indicator */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 font-medium capitalize">
        {avatarMode} Mode
      </div>
      
      {/* Switch hint */}
      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap opacity-70">
        Click to switch avatar
      </div>
    </motion.div>
  )
}

// Message Component
const MessageBubble = ({ message, isUser }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
  >
    <div
      className={`
        max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg
        ${isUser 
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md' 
          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
        }
      `}
    >
      <p className="text-sm leading-relaxed">{message}</p>
    </div>
  </motion.div>
)

const Assistant = () => {
  const { user, loading } = useAuth()
  const [messages, setMessages] = useState([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentStreamContent, setCurrentStreamContent] = useState('')
  const [error, setError] = useState('')
  const [audioLevel, setAudioLevel] = useState(0)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentStreamContent])

  // Welcome message
  useEffect(() => {
    if (!loading && user) {
      const welcomeMessage = `Hi ${user.user_metadata?.full_name || 'there'}! I'm your AI Recovery Coach. How are you feeling today?`
      setMessages([{ text: welcomeMessage, isUser: false, timestamp: new Date() }])
    }
  }, [user, loading])

  // COMPLETELY ENHANCED Speech Recognition Setup - FIXED VERSION 2.0
  const setupSpeechRecognition = useCallback(() => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      setError('🚫 Speech recognition not supported in this browser. Please use Chrome, Safari, or Edge.')
      return null
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    // ULTRA-ENHANCED CONFIGURATION
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.maxAlternatives = 5
    recognition.continuous = false
    
    let timeoutId
    let hasDetectedAnySound = false
    let hasDetectedSpeech = false
    let finalTranscript = ''
    let interimTranscript = ''
    
    recognition.onstart = () => {
      console.log('🎤 Speech recognition started successfully')
      setIsListening(true)
      setError('🎤 Listening... Speak now!')
      hasDetectedAnySound = false
      hasDetectedSpeech = false
      finalTranscript = ''
      interimTranscript = ''
      
      // REDUCED TIMEOUT to 5 seconds for faster feedback
      timeoutId = setTimeout(() => {
        if (!hasDetectedSpeech) {
          console.log('⏰ No speech detected within 5 seconds')
          recognition.stop()
          setError('🔇 No speech detected. Please speak louder and closer to your microphone.')
        }
      }, 5000)
    }
    
    // ENHANCED: Detect any audio activity
    recognition.onsoundstart = () => {
      console.log('🔊 Audio detected - microphone is picking up sound')
      hasDetectedAnySound = true
      setError('🔊 Sound detected! Keep speaking...')
      
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }
    
    // ENHANCED: Detect actual speech
    recognition.onspeechstart = () => {
      console.log('🗣️ Speech detected - processing your words')
      hasDetectedSpeech = true
      setError('🗣️ Speech detected! Processing your words...')
    }
    
    // ENHANCED: Process speech results with better feedback
    recognition.onresult = (event) => {
      console.log('📝 Processing speech results...')
      let newInterimTranscript = ''
      let newFinalTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          newFinalTranscript += result[0].transcript
        } else {
          newInterimTranscript += result[0].transcript
        }
      }
      
      // Update interim transcript for real-time feedback
      if (newInterimTranscript !== interimTranscript) {
        interimTranscript = newInterimTranscript
        setError(`Hearing: "${interimTranscript}"`)
      }
      
      // Process final result
      if (newFinalTranscript.trim()) {
        finalTranscript = newFinalTranscript.trim()
        console.log('✅ Final transcript received:', finalTranscript)
        setCurrentMessage(finalTranscript)
        setError('✅ Speech recognized successfully!')
        
        // Auto-send the message
        setTimeout(() => {
          queryAI(finalTranscript)
        }, 500)
      }
    }
    
    // ENHANCED ERROR HANDLING with specific solutions
    recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error)
      setIsListening(false)
      
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      
      const errorSolutions = {
        'network': '🌐 Network error. Please check your internet connection and try again.',
        'not-allowed': '🚫 Microphone access denied. Please click the microphone icon in your browser and allow access, then try again.',
        'no-speech': '🔇 No speech detected. Please speak louder, closer to your microphone, and ensure you\'re in a quiet environment.',
        'audio-capture': '🎤 Microphone not accessible. Please check your microphone connection and ensure no other apps are using it.',
        'service-not-allowed': '🚫 Speech recognition service blocked. Please enable speech services in your browser settings.',
        'bad-grammar': '🗣️ Speech not clearly recognized. Please speak more clearly and try again.',
        'aborted': '⏹️ Speech recognition was stopped.',
        'language-not-supported': '🌐 Language not supported. Please use English.',
        'no-match': '❓ No speech match found. Please speak more clearly.'
      }
      
      setError(errorSolutions[event.error] || `❌ Speech error: ${event.error}. Please try again.`)
    }
    
    recognition.onend = () => {
      console.log('⏹️ Speech recognition ended')
      setIsListening(false)
      
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      
      // Clear error if we got a successful result
      if (finalTranscript.trim()) {
        setError('')
      } else if (!hasDetectedAnySound) {
        setError('🔇 No audio detected. Please check your microphone and try again.')
      } else if (!hasDetectedSpeech) {
        setError('🎤 Audio detected but no clear speech. Please speak more clearly.')
      }
    }
    
    return recognition
  }, [])

  // Initialize speech recognition
  useEffect(() => {
    recognitionRef.current = setupSpeechRecognition()
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [setupSpeechRecognition])

  // ULTRA-ENHANCED microphone testing and initialization
  const handleStart = useCallback(async () => {
    if (!recognitionRef.current) {
      setError('🚫 Speech recognition not supported in this browser')
      return
    }
    
    setError('🔄 Initializing microphone...')
    
    try {
      console.log('🎤 Requesting microphone access with enhanced settings...')
      
      // Request microphone with optimal settings
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1,
          volume: 1.0
        }
      })
      
      console.log('✅ Microphone access granted, testing audio levels...')
      
      // Test microphone audio levels
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      microphone.connect(analyser)
      
      analyser.fftSize = 256
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      
      let audioDetected = false
      let maxLevel = 0
      
      const testAudio = () => {
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / bufferLength
        maxLevel = Math.max(maxLevel, average)
        setAudioLevel(average)
        
        if (average > 5) {
          audioDetected = true
        }
      }
      
      // Test for 1.5 seconds
      const testInterval = setInterval(testAudio, 100)
      setError('🎤 Testing microphone... Please speak to test audio levels.')
      
      setTimeout(() => {
        clearInterval(testInterval)
        
        // Clean up test resources
        stream.getTracks().forEach(track => track.stop())
        audioContext.close()
        setAudioLevel(0)
        
        if (!audioDetected && maxLevel < 2) {
          setError('🎤 Microphone connected but very low audio levels detected. Please check your microphone volume and speak louder.')
          return
        }
        
        if (maxLevel < 5) {
          setError('⚠️ Low audio levels detected. Please speak louder and closer to your microphone.')
        } else {
          setError('✅ Microphone test successful! Starting speech recognition...')
        }
        
        // Start speech recognition after test
        setTimeout(() => {
          try {
            if (recognitionRef.current) {
              recognitionRef.current.start()
            }
          } catch (e) {
            if (e.name === 'InvalidStateError') {
              setError('🎤 Speech recognition already active. Please wait a moment and try again.')
            } else {
              setError(`🚫 Failed to start speech recognition: ${e.message}`)
            }
          }
        }, 800)
        
      }, 1500)
      
    } catch (err) {
      console.error('❌ Microphone access error:', err)
      
      const microphoneErrors = {
        'NotAllowedError': '🚫 Microphone permission denied. Please click the microphone icon in your browser address bar and allow access, then refresh the page.',
        'NotFoundError': '🎤 No microphone found. Please connect a microphone to your device and try again.',
        'NotReadableError': '🎤 Microphone is busy or being used by another application. Please close other apps using the microphone and try again.',
        'OverconstrainedError': '⚙️ Microphone configuration error. Please try again or use a different microphone.',
        'SecurityError': '🔒 Security error accessing microphone. Please ensure you\'re using HTTPS.',
        'AbortError': '⏹️ Microphone access was aborted. Please try again.'
      }
      
      setError(microphoneErrors[err.name] || `🎤 Microphone error: ${err.message || 'Unknown error'}. Please check your microphone setup.`)
    }
  }, [])

  const handleStop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
    setError('')
    setAudioLevel(0)
  }, [])

  // AI Query function with enhanced error handling
  const queryAI = useCallback(async (prompt) => {
    setError('')
    setIsStreaming(false)
    setCurrentStreamContent('')
    
    try {
      // Try Gemini API first
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY
      
      if (geminiKey && geminiKey !== 'your-gemini-api-key-here') {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a compassionate AI recovery coach. The user said: "${prompt}". Provide encouraging, practical advice in 2-3 sentences. Be supportive and understanding.`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 200
            }
          })
        })

        if (response.ok) {
          const data = await response.json()
          const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
          
          if (aiResponse) {
            setMessages(prev => [...prev, 
              { text: prompt, isUser: true, timestamp: new Date() },
              { text: aiResponse, isUser: false, timestamp: new Date() }
            ])
            return
          }
        }
      }

      // Enhanced fallback responses based on keywords
      const keywordResponses = {
        'help': "I'm here to support you every step of the way. You're not alone in this journey, and asking for help shows incredible strength.",
        'sad': "I understand you're feeling down. These feelings are temporary, and you have the power to overcome them. What's one small thing that might bring you comfort right now?",
        'angry': "Anger is a natural emotion. Let's channel that energy into something positive. Take a deep breath, and remember that you're in control of your choices.",
        'anxious': "Anxiety can feel overwhelming, but you've gotten through difficult times before. Try some deep breathing - you're stronger than you know.",
        'craving': "Cravings are temporary but your recovery is permanent. This feeling will pass. You have the tools and strength to get through this moment.",
        'relapse': "Recovery isn't linear, and setbacks don't erase your progress. You're human, and every day is a new opportunity to move forward with compassion for yourself.",
        'thanks': "You're very welcome! Remember, I'm here whenever you need support. You're doing amazing work on your recovery journey."
      }
      
      const lowerPrompt = prompt.toLowerCase()
      let fallbackResponse = "I hear you. Remember, recovery is a journey, and every day you choose to stay strong is a victory. You have the power within you to overcome any challenge. How can I support you right now?"
      
      for (const [keyword, response] of Object.entries(keywordResponses)) {
        if (lowerPrompt.includes(keyword)) {
          fallbackResponse = response
          break
        }
      }
      
      setMessages(prev => [...prev, 
        { text: prompt, isUser: true, timestamp: new Date() },
        { text: fallbackResponse, isUser: false, timestamp: new Date() }
      ])
      
    } catch (error) {
      console.error('AI query failed:', error)
      setMessages(prev => [...prev, 
        { text: prompt, isUser: true, timestamp: new Date() },
        { text: "I'm here to support you. Every step forward in recovery is meaningful, no matter how small. You're doing great by reaching out.", isUser: false, timestamp: new Date() }
      ])
    }
  }, [])

  const handleSend = () => {
    if (currentMessage.trim()) {
      queryAI(currentMessage.trim())
      setCurrentMessage('')
    }
  }

  // Audio Level Visualization
  const AudioLevelMeter = () => (
    <div className="flex items-center gap-1">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full transition-all duration-150 ${
            audioLevel > (i * 15) ? 'bg-gradient-to-t from-green-500 to-blue-500' : 'bg-gray-300'
          }`}
          animate={{
            height: audioLevel > (i * 15) ? `${12 + (i * 2)}px` : '4px',
            opacity: audioLevel > (i * 15) ? 1 : 0.5
          }}
          transition={{ duration: 0.1 }}
        />
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access your AI Recovery Coach.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <OppenheimerBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Recovery Coach
          </h1>
          <p className="text-lg text-gray-600">
            Your compassionate companion on the journey to recovery
          </p>
        </motion.div>

        {/* Main Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            
            {/* Avatar Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
              <AnimatedAvatar 
                speaking={isStreaming}
                listening={isListening}
              />
              
              <motion.h3 
                className="text-white text-xl font-semibold mt-6"
                animate={{ scale: isListening ? [1, 1.02, 1] : 1 }}
                transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
              >
                {isListening ? 'I\'m listening carefully...' : 'AI Recovery Coach'}
              </motion.h3>
              
              {isListening && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-blue-100 text-sm flex items-center justify-center gap-3"
                >
                  <span>Speak now... I'm listening</span>
                  <AudioLevelMeter />
                </motion.div>
              )}
            </div>

            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white/50 to-gray-50/50">
              {messages.map((message, index) => (
                <MessageBubble key={index} message={message.text} isUser={message.isUser} />
              ))}
              
              {/* Streaming Response */}
              {isStreaming && currentStreamContent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start mb-4"
                >
                  <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm">
                    <p className="text-sm leading-relaxed">{currentStreamContent}</p>
                    <motion.div 
                      className="mt-2 w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Enhanced Error Display */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mx-6 mb-4 p-4 rounded-xl border ${
                  error.includes('✅') ? 'bg-green-50 border-green-200 text-green-700' :
                  error.includes('🔊') || error.includes('🗣️') ? 'bg-blue-50 border-blue-200 text-blue-700' :
                  error.includes('🎤') ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                  'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}

            {/* Input Section */}
            <div className="p-6 bg-gray-50/50 border-t border-gray-200/30">
              <div className="flex items-center space-x-4">
                {/* Enhanced Voice Input Button */}
                <motion.button
                  onClick={isListening ? handleStop : handleStart}
                  disabled={isStreaming}
                  className={`
                    relative p-4 rounded-full shadow-lg transition-all duration-300 transform
                    ${isListening 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 scale-110 shadow-red-400/50' 
                      : isStreaming
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-105 shadow-blue-400/30'
                    }
                  `}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={isListening ? { rotate: 360 } : {}}
                    transition={{ duration: 2, repeat: isListening ? Infinity : 0, ease: "linear" }}
                  >
                    {isListening ? (
                      <Square className="w-6 h-6 text-white" />
                    ) : (
                      <Mic className="w-6 h-6 text-white" />
                    )}
                  </motion.div>
                  
                  {/* Enhanced pulse effect when listening */}
                  {isListening && (
                    <>
                      <motion.div
                        className="absolute inset-0 bg-red-400 rounded-full"
                        animate={{ scale: [1, 1.6], opacity: [0.7, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute inset-0 bg-red-300 rounded-full"
                        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </>
                  )}
                </motion.button>

                {/* Text Input */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message or click the microphone to speak..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm transition-all duration-200"
                    disabled={isListening || isStreaming}
                  />
                </div>

                {/* Send Button */}
                <motion.button
                  onClick={handleSend}
                  disabled={!currentMessage.trim() || isListening || isStreaming}
                  className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
              
              {/* Enhanced Quick Actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { text: 'How am I doing?', prompt: 'How am I doing today with my recovery?', icon: '📊' },
                  { text: 'I need help', prompt: 'I need help and support right now', icon: '🆘' },
                  { text: 'Motivation', prompt: 'Give me some motivation and encouragement', icon: '💪' },
                  { text: 'Coping strategies', prompt: 'What are some good coping strategies I can use?', icon: '🧘' }
                ].map((quickAction, index) => (
                  <motion.button
                    key={index}
                    onClick={() => queryAI(quickAction.prompt)}
                    className="px-4 py-2 text-sm bg-white/70 hover:bg-white/90 border border-gray-200 rounded-full transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isListening || isStreaming}
                  >
                    <span>{quickAction.icon}</span>
                    <span>{quickAction.text}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Assistant
