import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Send, Mic, Square } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import OppenheimerBackground from '../components/OppenheimerBackground'

// Simple but effective AI Avatar Component
const AnimatedAvatar = ({ speaking, listening }) => {
  const [mouthState, setMouthState] = useState('closed')
  const [eyeState, setEyeState] = useState('normal')
  
  // Blinking animation
  useEffect(() => {
    const blink = () => {
      setEyeState('blink')
      setTimeout(() => setEyeState('normal'), 150)
    }
    
    const interval = setInterval(blink, 2000 + Math.random() * 3000)
    return () => clearInterval(interval)
  }, [])
  
  // Speaking animation
  useEffect(() => {
    if (speaking) {
      const patterns = ['closed', 'small', 'medium', 'wide']
      let currentPattern = 0
      
      const speechInterval = setInterval(() => {
        setMouthState(patterns[currentPattern])
        currentPattern = (currentPattern + 1) % patterns.length
      }, 150)
      
      return () => clearInterval(speechInterval)
    } else {
      setMouthState('closed')
    }
  }, [speaking])
  
  return (
    <motion.div 
      className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl"
      animate={{
        scale: speaking ? [1, 1.05, 1] : listening ? [1, 1.02, 1] : 1,
        boxShadow: speaking 
          ? ['0 10px 30px rgba(59,130,246,0.4)', '0 15px 40px rgba(139,92,246,0.5)', '0 10px 30px rgba(59,130,246,0.4)']
          : listening
          ? '0 10px 30px rgba(16,185,129,0.4)'
          : '0 10px 30px rgba(99,102,241,0.3)'
      }}
      transition={{
        scale: { duration: 0.3, repeat: speaking ? Infinity : 0 },
        boxShadow: { duration: 0.5, repeat: speaking ? Infinity : 0 }
      }}
    >
      {/* Simple AI face */}
      <div className="text-white text-4xl">🤖</div>
      
      {/* Voice waves when speaking */}
      <AnimatePresence>
        {speaking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -right-8 top-1/2 transform -translate-y-1/2"
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-6 h-6 border-2 border-blue-400 rounded-full"
                animate={{
                  scale: [0, 1.5],
                  opacity: [0.6, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Listening indicator */}
      <AnimatePresence>
        {listening && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -left-8 top-1/2 transform -translate-y-1/2"
          >
            <motion.div
              className="w-4 h-4 bg-green-400 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 1,
                repeat: Infinity
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
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
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const abortControllerRef = useRef(null)

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

  // Enhanced Speech Recognition Setup - FIXED VERSION
  const setupSpeechRecognition = useCallback(() => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      setError('🚫 Speech recognition not supported in this browser. Please use Chrome, Safari, or Edge.')
      return null
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    // ENHANCED CONFIGURATION FOR BETTER SPEECH DETECTION
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.maxAlternatives = 3
    recognition.continuous = false
    
    let timeoutId
    let hasDetectedSpeech = false
    let finalResult = ''
    
    recognition.onstart = () => {
      console.log('🎤 Speech recognition started')
      setIsListening(true)
      setError('')
      hasDetectedSpeech = false
      finalResult = ''
      
      // SHORTER TIMEOUT - 8 seconds instead of 15
      timeoutId = setTimeout(() => {
        if (!hasDetectedSpeech) {
          console.log('⏰ No speech detected within timeout')
          recognition.stop()
          setError('🔇 No speech detected. Please speak louder and closer to your microphone.')
        }
      }, 8000)
    }
    
    // ENHANCED: Listen for any sound
    recognition.onsoundstart = () => {
      console.log('🔊 Sound detected')
      hasDetectedSpeech = true
      setError('') // Clear timeout error
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }
    
    // ENHANCED: Listen specifically for speech
    recognition.onspeechstart = () => {
      console.log('🗣️ Speech detected')
      hasDetectedSpeech = true
      setError('Listening... speak now!')
    }
    
    recognition.onresult = (event) => {
      console.log('📝 Speech recognition result received')
      let interimTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalResult += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }
      
      // Show interim results to user
      if (interimTranscript) {
        setError(`Hearing: "${interimTranscript}"`)
      }
      
      if (finalResult.trim()) {
        console.log('✅ Final transcript:', finalResult)
        setCurrentMessage(finalResult.trim())
        queryAI(finalResult.trim())
      }
    }
    
    recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error)
      setIsListening(false)
      
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      
      const errorMessages = {
        'network': '🌐 Network error. Please check your internet connection.',
        'not-allowed': '🚫 Microphone permission denied. Please allow microphone access and try again.',
        'no-speech': '🔇 No speech detected. Please speak louder and closer to your microphone.',
        'audio-capture': '🎤 Microphone not found. Please check your microphone connection.',
        'service-not-allowed': '🚫 Speech recognition service not allowed.',
        'bad-grammar': '🗣️ Speech not recognized clearly. Please try again.',
        'aborted': '⏹️ Speech recognition was stopped.'
      }
      
      setError(errorMessages[event.error] || `❌ Speech error: ${event.error}`)
    }
    
    recognition.onend = () => {
      console.log('⏹️ Speech recognition ended')
      setIsListening(false)
      
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      
      // If we got a result, clear any error
      if (finalResult.trim()) {
        setError('')
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

  // ENHANCED START FUNCTION with better microphone handling
  const handleStart = useCallback(async () => {
    if (!recognitionRef.current) {
      setError('🚫 Speech recognition not supported')
      return
    }
    
    setError('')
    
    // ENHANCED: Check microphone permissions first
    try {
      console.log('🎤 Requesting microphone access...')
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      })
      
      // Test if microphone is actually working
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      microphone.connect(analyser)
      
      analyser.fftSize = 256
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      
      // Check for actual audio input
      let hasAudio = false
      const checkAudio = () => {
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / bufferLength
        if (average > 0) {
          hasAudio = true
        }
      }
      
      // Check for 1 second
      const audioCheckInterval = setInterval(checkAudio, 100)
      
      setTimeout(() => {
        clearInterval(audioCheckInterval)
        
        // Clean up
        stream.getTracks().forEach(track => track.stop())
        audioContext.close()
        
        if (!hasAudio) {
          setError('🎤 Microphone detected but no audio input. Please check your microphone settings.')
          return
        }
        
        // Start recognition
        try {
          recognitionRef.current.start()
        } catch (e) {
          if (e.name === 'InvalidStateError') {
            setError('🎤 Speech recognition already active. Please wait.')
          } else {
            setError(`🚫 Failed to start: ${e.message}`)
          }
        }
      }, 1000)
      
    } catch (err) {
      console.error('❌ Microphone access error:', err)
      
      if (err.name === 'NotAllowedError') {
        setError('🚫 Microphone permission denied. Please click the microphone icon in your browser and allow access.')
      } else if (err.name === 'NotFoundError') {
        setError('🎤 No microphone found. Please connect a microphone and try again.')
      } else if (err.name === 'NotReadableError') {
        setError('🎤 Microphone is being used by another application. Please close other apps using the microphone.')
      } else {
        setError(`🎤 Microphone error: ${err.message}`)
      }
    }
  }, [])

  const handleStop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
    setError('')
  }, [])

  // AI Query function
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
                text: `You are a compassionate AI recovery coach. The user said: "${prompt}". Provide encouraging, practical advice in 2-3 sentences.`
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

      // Fallback response
      const fallbackResponse = "I hear you. Remember, recovery is a journey, and every day you choose to stay strong is a victory. You have the power within you to overcome any challenge. How can I support you right now?"
      
      setMessages(prev => [...prev, 
        { text: prompt, isUser: true, timestamp: new Date() },
        { text: fallbackResponse, isUser: false, timestamp: new Date() }
      ])
      
    } catch (error) {
      console.error('AI query failed:', error)
      setMessages(prev => [...prev, 
        { text: prompt, isUser: true, timestamp: new Date() },
        { text: "I'm here to support you. Every step forward in recovery is meaningful, no matter how small.", isUser: false, timestamp: new Date() }
      ])
    }
  }, [messages])

  const handleSend = () => {
    if (currentMessage.trim()) {
      queryAI(currentMessage.trim())
      setCurrentMessage('')
    }
  }

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
                className="text-white text-xl font-semibold mt-4"
                animate={{ scale: isListening ? [1, 1.02, 1] : 1 }}
                transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
              >
                {isListening ? 'I\'m listening...' : 'AI Recovery Coach'}
              </motion.h3>
              
              {isListening && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-blue-100 text-sm"
                >
                  Speak now... I'm listening carefully
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

            {/* Error Display */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-700 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Input Section */}
            <div className="p-6 bg-gray-50/50 border-t border-gray-200/30">
              <div className="flex items-center space-x-4">
                {/* Voice Input Button */}
                <motion.button
                  onClick={isListening ? handleStop : handleStart}
                  disabled={isStreaming}
                  className={`
                    relative p-4 rounded-full shadow-lg transition-all duration-300 transform
                    ${isListening 
                      ? 'bg-red-500 hover:bg-red-600 scale-110' 
                      : isStreaming
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
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
                  
                  {/* Pulse effect when listening */}
                  {isListening && (
                    <motion.div
                      className="absolute inset-0 bg-red-400 rounded-full"
                      animate={{ scale: [1, 1.4], opacity: [0.7, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                    disabled={isListening || isStreaming}
                  />
                </div>

                {/* Send Button */}
                <motion.button
                  onClick={handleSend}
                  disabled={!currentMessage.trim() || isListening || isStreaming}
                  className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { text: 'How am I doing?', action: () => queryAI('How am I doing today?') },
                  { text: 'I need help', action: () => queryAI('I need help right now') },
                  { text: 'Motivation', action: () => queryAI('Give me some motivation') }
                ].map((quickAction, index) => (
                  <motion.button
                    key={index}
                    onClick={quickAction.action}
                    className="px-3 py-1.5 text-sm bg-white/60 hover:bg-white/80 border border-gray-200 rounded-full transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isListening || isStreaming}
                  >
                    {quickAction.text}
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
