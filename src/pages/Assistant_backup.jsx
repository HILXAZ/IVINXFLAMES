import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Send, Mic, Square, Volume2, VolumeX, Settings, Repeat } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import VoiceAssistantSimple from '../components/VoiceAssistantSimple'
import GlassmorphismCard from '../components/GlassmorphismCard'
// Removed OppenheimerBackground to avoid black background overlay

// High-fidelity "German Robot" video-like avatar
const AnimatedAvatar = ({ speaking, listening }) => {
  const [blink, setBlink] = useState(false)
  const [glitch, setGlitch] = useState(false)

  // Soft eye blink
  useEffect(() => {
    const id = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 90)
    }, 2600 + Math.random() * 1800)
    return () => clearInterval(id)
  }, [])

  // Occasional glitch while speaking
  useEffect(() => {
    if (!speaking) return
    const id = setInterval(() => setGlitch(g => !g), 1200)
    return () => clearInterval(id)
  }, [speaking])

  const barAnim = (i) => ({
    height: speaking ? [6, 18 + (i * 3), 8] : [6, 6, 6],
    opacity: speaking ? [0.6, 1, 0.7] : [0.6, 0.6, 0.6]
  })

  return (
    <motion.div
      className="relative w-32 h-32 mx-auto rounded-2xl overflow-hidden"
      style={{
        boxShadow: speaking
          ? '0 0 30px rgba(59,130,246,0.35), inset 0 0 12px rgba(59,130,246,0.25)'
          : listening
          ? '0 0 22px rgba(16,185,129,0.35)'
          : '0 6px 18px rgba(0,0,0,0.15)'
      }}
      animate={{ scale: speaking ? [1, 1.04, 1] : listening ? [1, 1.02, 1] : 1 }}
      transition={{ duration: 0.6, repeat: speaking || listening ? Infinity : 0 }}
    >
      {/* Robot head (brushed metal) */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-400" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.6),transparent_60%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.35),transparent_55%)] mix-blend-overlay" />
      <div className="absolute inset-0 border-2 border-slate-500 rounded-2xl" />

      {/* German accent badge (black-red-gold) */}
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-2.5 rounded-sm overflow-hidden shadow">
        <div className="w-full h-1 bg-black" />
        <div className="w-full h-1 bg-red-600" />
        <div className="w-full h-1 bg-yellow-400" />
      </div>

      {/* Ears */}
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-8 bg-slate-500 rounded-l-lg" />
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-8 bg-slate-500 rounded-r-lg" />

      {/* Eyes (LED panels) */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-3">
        {[0, 1].map(i => (
          <motion.div
            key={i}
            className="relative w-8 h-5 rounded-md border border-slate-600 bg-gradient-to-b from-blue-500 to-indigo-600 overflow-hidden"
            animate={{
              filter: blink ? 'brightness(0.4)' : speaking ? 'brightness(1.2)' : listening ? 'brightness(1.05)' : 'brightness(1)'
            }}
            transition={{ duration: 0.15 }}
          >
            {/* Eye scan */}
            <motion.div
              className="absolute inset-x-0 top-0 h-0.5 bg-cyan-300/80"
              animate={{ y: [0, 18, 0], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            />
          </motion.div>
        ))}
      </div>

      {/* Mouth (speaker bars) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-24 h-8 rounded-md bg-slate-700/90 border border-slate-800 flex items-center justify-center gap-1 px-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="w-2 rounded-sm bg-gradient-to-t from-blue-400 to-cyan-400"
            animate={barAnim(i)}
            transition={{ duration: 0.35 + i * 0.03, repeat: speaking ? Infinity : 0, ease: 'easeInOut' }}
            style={{ height: 6 }}
          />
        ))}
      </div>

      {/* Status LEDs */}
      <div className="absolute bottom-1.5 left-2 flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${listening ? 'bg-emerald-400' : 'bg-slate-400'}`} />
        <div className={`w-2 h-2 rounded-full ${speaking ? 'bg-sky-400' : 'bg-slate-400'}`} />
      </div>

      {/* Video-like scanlines */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(180deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 2px, transparent 4px)'
        }}
        animate={{ opacity: speaking ? [0.25, 0.4, 0.25] : [0.15] }}
        transition={{ duration: 1.6, repeat: speaking ? Infinity : 0 }}
      />

      {/* Light noise/glitch overlay */}
      <motion.div
        className="pointer-events-none absolute inset-0 mix-blend-overlay"
        style={{
          background: 'linear-gradient(115deg, rgba(255,255,255,0.08), rgba(0,0,0,0.05))'
        }}
        animate={{ x: glitch ? [0, 2, -2, 0] : 0 }}
        transition={{ duration: 0.25 }}
      />
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
  // Voice Assistant Toggle
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false)
  // Text-to-Speech (TTS)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [voices, setVoices] = useState([])
  const [ttsVoiceId, setTtsVoiceId] = useState('')
  const [ttsRate, setTtsRate] = useState(1)
  const [ttsPitch, setTtsPitch] = useState(1)
  const [showTtsSettings, setShowTtsSettings] = useState(false)
  // Language selection: 'en' (English) or 'ml' (Malayalam)
  const [language, setLanguage] = useState('en')
  // Microphone devices and permissions
  const [micDevices, setMicDevices] = useState([])
  const [selectedMicId, setSelectedMicId] = useState('')
  const [continuousMode, setContinuousMode] = useState(false)
  const [permState, setPermState] = useState('unknown') // granted | denied | prompt | unknown
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const fallbackTriedRef = useRef(false) // auto-fallback to en-US if ml-IN fails
  const manualStopRef = useRef(false) // track explicit user stop to control auto-restart

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
      const welcomeEn = `Hi ${user.user_metadata?.full_name || 'there'}! I'm your AI Recovery Coach. How are you feeling today?`
      const welcomeMl = `ഹായ് ${user.user_metadata?.full_name || 'സുഹൃത്ത്'}! ഞാൻ നിങ്ങളുടെ AI Recovery Coach ആണ്. ഇന്നു നിങ്ങൾ എങ്ങനെ അനുഭവിക്കുന്നു?`
      const welcomeMessage = language === 'ml' ? welcomeMl : welcomeEn
      setMessages([{ text: welcomeMessage, isUser: false, timestamp: new Date() }])
      if (ttsEnabled) {
        // speak welcome
        try { speak(welcomeMessage) } catch {}
      }
    }
  }, [user, loading, language, ttsEnabled])

  // COMPLETELY ENHANCED Speech Recognition Setup - FIXED VERSION 2.0
  const setupSpeechRecognition = useCallback((forcedLang) => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      setError('🚫 Speech recognition not supported in this browser. Please use Chrome, Safari, or Edge.')
      return null
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    // ULTRA-ENHANCED CONFIGURATION
    recognition.lang = forcedLang || (language === 'ml' ? 'ml-IN' : 'en-US')
  recognition.interimResults = true
  recognition.maxAlternatives = 5
  recognition.continuous = !!continuousMode
    
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
      
    // Timeout: give user up to 8 seconds to start speaking
      timeoutId = setTimeout(() => {
        if (!hasDetectedSpeech) {
      console.log('⏰ No speech detected within timeout')
          recognition.stop()
          setError('🔇 No speech detected. Please speak louder and closer to your microphone.')
        }
    }, 8000)
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
  // reset fallback flag
  fallbackTriedRef.current = false
        
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

      // Auto fallback to English if Malayalam likely unsupported or not matching
      const likelyLangIssue = event.error === 'language-not-supported' || event.error === 'no-speech'
      const isMl = (forcedLang || (language === 'ml')) && (forcedLang !== 'en-US')
      if (likelyLangIssue && isMl && !fallbackTriedRef.current) {
        fallbackTriedRef.current = true
        setTimeout(() => {
          const fb = setupSpeechRecognition('en-US')
          if (fb) {
            recognitionRef.current = fb
            setError('🌐 Malayalam STT may not be unavailable on this device. Trying English fallback...')
            try { fb.start() } catch {}
          }
        }, 300)
      }
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
        // If Malayalam selected but nothing finalized, auto-try English once
        const isMl = (forcedLang || (language === 'ml')) && (forcedLang !== 'en-US')
        if (isMl && !fallbackTriedRef.current) {
          fallbackTriedRef.current = true
          const fb = setupSpeechRecognition('en-US')
          if (fb) {
            recognitionRef.current = fb
            setError('🌐 Trying English fallback...')
            try { fb.start() } catch {}
            return
          }
        }
      }

      // Continuous mode: auto-restart unless explicitly stopped
      if (continuousMode && !manualStopRef.current) {
        try {
          setTimeout(() => {
            try { recognition.start() } catch {}
          }, 300)
        } catch {}
      }
    }
    
    return recognition
  }, [language, continuousMode])

  // Initialize speech recognition
  useEffect(() => {
    recognitionRef.current = setupSpeechRecognition()
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      // Stop any ongoing speech on unmount
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel() } catch {}
      }
    }
  }, [setupSpeechRecognition])

  // Load available TTS voices (browser-provided)
  useEffect(() => {
    if (!('speechSynthesis' in window)) return
    const synth = window.speechSynthesis
    const loadVoices = () => {
      const list = synth.getVoices()
      if (list && list.length) {
        setVoices(list)
        // Try to restore saved voice if not set yet
        try {
          const savedId = localStorage.getItem('assistant_tts_voiceId')
          if (savedId && !ttsVoiceId && list.some(v => v.voiceURI === savedId)) {
            setTtsVoiceId(savedId)
          }
        } catch {}
      }
    }
    loadVoices()
    synth.onvoiceschanged = loadVoices
    return () => { synth.onvoiceschanged = null }
  }, [ttsVoiceId])

  const speak = useCallback((text) => {
    if (!ttsEnabled || !text) return
    if (!('speechSynthesis' in window)) {
      // Show once to avoid noise
      setError((prev) => prev || '🔈 Text-to-Speech not supported in this browser. Use Chrome/Edge/Safari.')
      return
    }
    try {
      const synth = window.speechSynthesis
      synth.cancel() // stop any previous utterances
      const utter = new SpeechSynthesisUtterance(text)
      // Prefer selected voice, else a voice for the selected language
      let chosen = undefined
      if (ttsVoiceId) {
        chosen = voices.find(v => v.voiceURI === ttsVoiceId)
      }
      if (!chosen) {
        const targetPrefix = language === 'ml' ? 'ml' : 'en'
        chosen = voices.find(v => v.lang?.toLowerCase().startsWith(targetPrefix))
      }
      if (chosen) utter.voice = chosen
      utter.lang = (chosen?.lang) || (language === 'ml' ? 'ml-IN' : 'en-US')
      utter.rate = ttsRate || 1
      utter.pitch = ttsPitch || 1
      utter.volume = 1
      utter.onstart = () => setIsStreaming(true)
      utter.onend = () => setIsStreaming(false)
      synth.speak(utter)
    } catch (e) {
      console.error('TTS error:', e)
      setError('🔈 Failed to play voice response.')
    }
  }, [ttsEnabled, voices, language, ttsVoiceId, ttsRate, ttsPitch])

  // Persist TTS preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('assistant_tts_enabled')
      if (saved !== null) setTtsEnabled(saved === 'true')
    } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem('assistant_tts_enabled', String(ttsEnabled)) } catch {}
  }, [ttsEnabled])

  // Persist TTS detailed settings
  useEffect(() => {
    try {
      const v = localStorage.getItem('assistant_tts_voiceId')
      const r = localStorage.getItem('assistant_tts_rate')
      const p = localStorage.getItem('assistant_tts_pitch')
      if (v) setTtsVoiceId(v)
      if (r) setTtsRate(parseFloat(r) || 1)
      if (p) setTtsPitch(parseFloat(p) || 1)
    } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem('assistant_tts_voiceId', ttsVoiceId || '') } catch {}
  }, [ttsVoiceId])
  useEffect(() => {
    try { localStorage.setItem('assistant_tts_rate', String(ttsRate)) } catch {}
  }, [ttsRate])
  useEffect(() => {
    try { localStorage.setItem('assistant_tts_pitch', String(ttsPitch)) } catch {}
  }, [ttsPitch])

  // Persist language preference
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('assistant_lang')
      if (savedLang === 'ml' || savedLang === 'en') setLanguage(savedLang)
    } catch {}
  }, [])
  useEffect(() => {
  try { localStorage.setItem('assistant_lang', language); fallbackTriedRef.current = false } catch {}
  }, [language])

  // Load and watch microphone devices + permission state
  useEffect(() => {
    const loadDevices = async () => {
      if (!navigator.mediaDevices?.enumerateDevices) return
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const mics = devices.filter(d => d.kind === 'audioinput')
        setMicDevices(mics)
        // If no selected device yet, try restore
        if (!selectedMicId) {
          const saved = localStorage.getItem('assistant_mic_device')
          if (saved && mics.some(d => d.deviceId === saved)) {
            setSelectedMicId(saved)
          } else if (mics[0]) {
            setSelectedMicId(mics[0].deviceId)
          }
        }
      } catch (e) {
        // ignore
      }
    }

    loadDevices()
    const onChange = () => loadDevices()
    try { navigator.mediaDevices?.addEventListener?.('devicechange', onChange) } catch {}

    // Permissions state
    try {
      if (navigator.permissions?.query) {
        navigator.permissions.query({ name: 'microphone' }).then(status => {
          setPermState(status.state)
          status.onchange = () => setPermState(status.state)
        }).catch(() => {})
      }
    } catch {}

    return () => {
      try { navigator.mediaDevices?.removeEventListener?.('devicechange', onChange) } catch {}
    }
  }, [selectedMicId])

  // Persist mic + continuous toggle
  useEffect(() => {
    try { localStorage.setItem('assistant_mic_device', selectedMicId || '') } catch {}
  }, [selectedMicId])
  useEffect(() => {
    try {
      const saved = localStorage.getItem('assistant_stt_continuous')
      if (saved != null) setContinuousMode(saved === 'true')
    } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem('assistant_stt_continuous', String(continuousMode)) } catch {}
  }, [continuousMode])

  // ULTRA-ENHANCED microphone testing and initialization
  const handleStart = useCallback(async () => {
    if (!recognitionRef.current) {
      setError('🚫 Speech recognition not supported in this browser')
      return
    }
    
    setError('🔄 Initializing microphone...')
    fallbackTriedRef.current = false
    manualStopRef.current = false
    
    try {
      console.log('🎤 Requesting microphone access with enhanced settings...')
      
      // Request microphone with optimal settings
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          deviceId: selectedMicId ? { exact: selectedMicId } : undefined,
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
    manualStopRef.current = true
    setIsListening(false)
    setError('')
    setAudioLevel(0)
  }, [])

  // Explicit permission request (for banner/button)
  const requestMicPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(t => t.stop())
      setPermState('granted')
      setError('✅ Microphone permission granted. You can start speaking now.')
    } catch (e) {
      setPermState('denied')
      setError('🚫 Microphone permission denied. Use the browser address bar (🔒 icon) to allow the microphone and then retry.')
    }
  }, [])

  // AI Query function with enhanced error handling and guaranteed responses
  const queryAI = useCallback(async (prompt) => {
    setError('')
    setIsStreaming(false)
    setCurrentStreamContent('')
    
    // Always add user message first
    setMessages(prev => [...prev, 
      { text: prompt, isUser: true, timestamp: new Date() }
    ])
    
    let assistantResponse = null
    
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
                text: `You are a compassionate AI recovery coach. The user said: "${prompt}".
Respond in ${language === 'ml' ? 'Malayalam' : 'English'}.
Provide encouraging, practical advice in 2-3 sentences. Be supportive and understanding.`
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
          assistantResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
          
          if (assistantResponse && assistantResponse.trim().length > 0) {
            setMessages(prev => [...prev, 
              { text: assistantResponse, isUser: false, timestamp: new Date() }
            ])
            speak(assistantResponse)
            return
          }
        }
      }
    } catch (error) {
      console.warn('Gemini API failed, using fallback:', error)
    }

    // Enhanced fallback system - GUARANTEED to provide a response
    try {
      const keywordResponsesEn = {
        'help': "I'm here to support you every step of the way. You're not alone in this journey, and asking for help shows incredible strength.",
        'sad': "I understand you're feeling down. These feelings are temporary, and you have the power to overcome them. What's one small thing that might bring you comfort right now?",
        'angry': "Anger is a natural emotion. Let's channel that energy into something positive. Take a deep breath, and remember that you're in control of your choices.",
        'anxious': "Anxiety can feel overwhelming, but you've gotten through difficult times before. Try some deep breathing - you're stronger than you know.",
        'craving': "Cravings are temporary but your recovery is permanent. This feeling will pass. You have the tools and strength to get through this moment.",
        'relapse': "Recovery isn't linear, and setbacks don't erase your progress. You're human, and every day is a new opportunity to move forward with compassion for yourself.",
        'thanks': "You're very welcome! Remember, I'm here whenever you need support. You're doing amazing work on your recovery journey.",
        'motivation': "Your commitment to recovery is inspiring. Every day you choose sobriety, you're rewiring your brain for health and happiness.",
        'tired': "Feeling tired in recovery is normal. Your body and mind are healing. Rest is part of the process. Be gentle with yourself.",
        'stress': "Stress can feel overwhelming, but you have coping tools. Try deep breathing, take a walk, or reach out to your support system.",
        'lonely': "Loneliness is difficult, but you're not truly alone. Consider calling a friend, attending a meeting, or connecting with others in recovery.",
        'family': "Family relationships in recovery can be complex. Focus on what you can control - your actions and responses. Healing takes time.",
        'work': "Work stress is common in recovery. Remember your priorities: sobriety first, then everything else follows. You've got this.",
        'sleep': "Sleep issues are common in early recovery. Try a relaxing bedtime routine, avoid screens before bed, and be patient with the process.",
        'exercise': "Exercise is a powerful tool in recovery. Even a short walk can boost your mood and reduce cravings. Every bit of movement helps.",
        'food': "Nutrition supports recovery. Try to eat regular, balanced meals. Proper nutrition helps stabilize mood and energy levels.",
        'meeting': "Meetings are valuable for recovery. Whether in person or online, connecting with others who understand your journey is powerful.",
        'sponsor': "Having a sponsor provides guidance and accountability. If you don't have one, consider asking someone you respect in recovery.",
        'therapy': "Therapy is an important part of recovery. It provides tools and insights for long-term success. Keep up the good work.",
        'medication': "If you're taking medication for recovery or mental health, stay consistent and work with your healthcare provider.",
        'progress': "Every day in recovery is progress, even the difficult ones. You're building resilience and creating new neural pathways.",
        'setback': "Setbacks are learning opportunities, not failures. What matters is that you're here now, committed to moving forward.",
        'future': "Your future is bright in recovery. You're not just getting your life back - you're creating a life worth living.",
        'hope': "Hope is essential in recovery. Even in dark moments, remember that things can and will get better. You matter.",
        'friend': "Friendships in recovery may change, and that's okay. Focus on building relationships with people who support your sobriety.",
        'change': "Change is challenging but necessary for growth. You're already proving you can change by choosing recovery every day."
      }
      
      const keywordResponsesMl = {
        'help': 'നിങ്ങളെ ഞാൻ എല്ലാ ഘട്ടങ്ങളിലും പിന്തുണയ്ക്കും. സഹായം ചോദിക്കുന്നത് വലിയ ശക്തിയുടെ അടയാളമാണ്. നിങ്ങൾ ഒറ്റയാളൻ അല്ല.',
        'sad': 'നിങ്ങൾ ദുഖിതനാണെന്ന് ഞാൻ മനസ്സിലാക്കുന്നു. ഈ അനുഭവങ്ങൾ താൽക്കാലികമാണ്. നിങ്ങൾക്ക് ഇത് കീഴടക്കാൻ ശക്തിയുണ്ട്.',
        'angry': 'കോപം സ്വാഭാവികമാണ്. ആ ഊർജം നന്നിലേക്ക് മാറ്റാം. ആഴത്തിൽ ശ്വസിക്കൂ; നിങ്ങൾക്ക് നിങ്ങളുടെ തെരഞ്ഞെടുപ്പുകൾ നിയന്ത്രിക്കാം.',
        'anxious': 'ആകുലത ഭാരമായി തോന്നാം, എന്നാൽ നിങ്ങൾ മുമ്പും ബുദ്ധിമുട്ടുകൾ കടന്നുപോയിട്ടുണ്ട്. ആഴത്തിലുള്ള ശ്വാസം എടുക്കൂ.',
        'craving': 'ആഗ്രഹങ്ങൾ താൽക്കാലികമാണ്, നിങ്ങളുടെ സൗഖ്യം സ്ഥിരമാണ്. ഈ തോന്നൽ കടന്നുപോകും.',
        'relapse': 'സൗഖ്യം നേരിയരേഖയല്ല. ചെറിയ പിഴവുകൾ നിങ്ങളുടെ പുരോഗതിയെ ഇല്ലാതാക്കില്ല.',
        'thanks': 'ഉള്ളൊന്നില്ല! നിങ്ങൾക്ക് സഹായം ആവശ്യമുണ്ടെങ്കിൽ ഞാൻ ഇവിടെ ഉണ്ടാകും.'
      }
      
      const lowerPrompt = prompt.toLowerCase()
      let fallbackResponse = null
      
      // Try to find keyword-based response
      const dict = language === 'ml' ? keywordResponsesMl : keywordResponsesEn
      for (const [keyword, response] of Object.entries(dict)) {
        if (lowerPrompt.includes(keyword)) {
          fallbackResponse = response
          break
        }
      }
      
      // If no keyword match, use contextual analysis
      if (!fallbackResponse) {
        fallbackResponse = generateContextualResponse(prompt, language)
      }
      
      // Final fallback if nothing else works
      if (!fallbackResponse || fallbackResponse.trim().length === 0) {
        fallbackResponse = language === 'ml'
          ? 'ഞാൻ നിങ്ങളെ കേൾക്കുന്നു. സൗഖ്യം ഒരു യാത്രയാണ്. ഓരോ ദിവസവും നിങ്ങൾ ശക്തരാകാൻ തെരഞ്ഞെടുത്താൽ അതൊരു വിജയം തന്നെ. നിങ്ങൾക്ക് ഇത് ജയിക്കാം.'
          : 'I hear you. Remember, recovery is a journey, and every day you choose to stay strong is a victory. You have the power within you to overcome any challenge. How can I support you right now?'
      }
      
      setMessages(prev => [...prev, 
        { text: fallbackResponse, isUser: false, timestamp: new Date() }
      ])
      speak(fallbackResponse)
      
    } catch (fallbackError) {
      console.error('Even fallback failed:', fallbackError)
      // Last resort - emergency response
      const emergencyResponse = language === 'ml'
        ? 'ഞാൻ ഇവിടെയുണ്ട്. നിങ്ങൾ ശക്തരാണ്.'
        : "I'm here for you. You are strong and capable."
      
      setMessages(prev => [...prev, 
        { text: emergencyResponse, isUser: false, timestamp: new Date() }
      ])
      speak(emergencyResponse)
    }
  }, [language, speak])

  // Generate contextual response based on message content
  const generateContextualResponse = (prompt, lang) => {
    const lowerPrompt = prompt.toLowerCase()
    
    // Question patterns
    if (lowerPrompt.includes('?') || lowerPrompt.startsWith('what') || lowerPrompt.startsWith('how') || lowerPrompt.startsWith('why')) {
      return lang === 'ml' 
        ? 'നിങ്ങളുടെ ചോദ്യം പ്രധാനപ്പെട്ടതാണ്. സൗഖ്യത്തിൽ ചോദ്യങ്ങൾ ചോദിക്കുന്നത് വളർച്ചയുടെ ഭാഗമാണ്. നിങ്ങൾ ശരിയായ പാതയിലാണ്.'
        : 'Your question is important. Asking questions is part of growth in recovery. You\'re on the right path.'
    }
    
    // Emotional expressions
    if (lowerPrompt.includes('feel') || lowerPrompt.includes('emotion') || lowerPrompt.includes('mood')) {
      return lang === 'ml'
        ? 'നിങ്ങളുടെ വികാരങ്ങൾ സാധുവാണ്. സൗഖ്യത്തിൽ വികാരങ്ങൾ കൈകാര്യം ചെയ്യാൻ പഠിക്കുന്നത് പ്രധാനമാണ്.'
        : 'Your feelings are valid. Learning to manage emotions is an important part of recovery.'
    }
    
    // Time-related
    if (lowerPrompt.includes('today') || lowerPrompt.includes('tomorrow') || lowerPrompt.includes('day')) {
      return lang === 'ml'
        ? 'ഓരോ ദിവസവും പുതിയ അവസരമാണ്. ഇന്നലത്തെ ബുദ്ധിമുട്ടുകൾ ഇന്നത്തെ വിജയത്തെ തടഞ്ഞുനിർത്തേണ്ടതില്ല.'
        : 'Each day is a new opportunity. Yesterday\'s struggles don\'t have to define today\'s success.'
    }
    
    // Generic supportive responses based on message length
    if (prompt.length < 10) {
      return lang === 'ml'
        ? 'ഞാൻ കേൾക്കുന്നു. കൂടുതൽ പറയാൻ തോന്നുന്നുണ്ടോ?'
        : 'I\'m listening. Would you like to share more?'
    } else if (prompt.length > 100) {
      return lang === 'ml'
        ? 'നിങ്ങൾ പങ്കുവെച്ചതിന് നന്ദി. നിങ്ങളുടെ ചിന്തകളും വികാരങ്ങളും പ്രധാനമാണ്.'
        : 'Thank you for sharing. Your thoughts and feelings matter.'
    }
    
    return null // Will trigger final fallback
  }

  const handleSend = () => {
    if (currentMessage.trim() && !isListening && !isStreaming) {
      const messageText = currentMessage.trim();
      console.log('📝 Sending typed message:', messageText);
      queryAI(messageText);
      setCurrentMessage('');
      
      // Clear any existing errors
      setError('');
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 relative"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Recovery Coach
          </h1>
          <p className="text-lg text-gray-600">
            Your compassionate companion on the journey to recovery
          </p>
          
          {/* Voice Assistant Toggle Button */}
          <motion.button
            onClick={() => setShowVoiceAssistant(!showVoiceAssistant)}
            className={`absolute top-0 right-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-lg ${
              showVoiceAssistant 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-white text-purple-600 border border-purple-600 hover:bg-purple-50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Mic className="w-4 h-4" />
            {showVoiceAssistant ? 'Hide Assistant' : 'Voice Assistant'}
          </motion.button>
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

            {/* Microphone permission banner */}
            {(permState === 'denied' || permState === 'prompt') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-6 my-3 p-4 rounded-xl border bg-yellow-50 border-yellow-200 text-yellow-800 flex items-center justify-between gap-3"
              >
                <div className="text-sm">
                  {permState === 'denied' ? (
                    <span>Microphone is blocked. Click the lock icon in the address bar and allow the microphone for this site, then press Retry.</span>
                  ) : (
                    <span>This app needs microphone access to hear you. Please allow access.</span>
                  )}
                </div>
                <motion.button
                  onClick={requestMicPermission}
                  className="px-3 py-2 rounded-lg bg-white border border-yellow-300 shadow-sm text-sm hover:bg-yellow-100"
                  whileTap={{ scale: 0.96 }}
                >
                  Retry
                </motion.button>
              </motion.div>
            )}

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

            {/* Input Section with Usage Tips */}
            <div className="p-6 bg-gray-50/50 border-t border-gray-200/30 space-y-4">
              {/* Enhanced usage tip */}
              <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="font-medium mb-1">💡 How to use:</div>
                <div className="space-y-1">
                  <div>• <strong>Type:</strong> Write your message and press <kbd className="px-1 py-0.5 bg-white border rounded text-xs">Enter</kbd> to send</div>
                  <div>• <strong>Voice:</strong> Click the <strong>🎤 microphone button</strong> and speak clearly</div>
                  <div>• <strong>Quick tips:</strong> Use the prompt buttons above for common questions</div>
                  <div>• <strong>Shortcuts:</strong> <kbd className="px-1 py-0.5 bg-white border rounded text-xs">Escape</kbd> to clear, <kbd className="px-1 py-0.5 bg-white border rounded text-xs">Ctrl+Enter</kbd> to send</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* TTS Toggle */}
                <motion.button
                  onClick={() => setTtsEnabled(v => !v)}
                  className={`p-3 rounded-xl border shadow-sm transition-colors ${ttsEnabled ? 'bg-white border-green-200 hover:border-green-300' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                  title={ttsEnabled ? 'Voice responses: On' : 'Voice responses: Off'}
                  whileTap={{ scale: 0.95 }}
                >
                  {ttsEnabled ? <Volume2 className="w-5 h-5 text-green-600" /> : <VolumeX className="w-5 h-5 text-gray-500" />}
                </motion.button>
                {/* TTS Settings */}
                <motion.button
                  onClick={() => setShowTtsSettings(v => !v)}
                  className="p-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-gray-300"
                  title="Voice settings"
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings className="w-5 h-5 text-gray-700" />
                </motion.button>
                {/* Language Toggle */}
                <motion.button
                  onClick={() => setLanguage(prev => prev === 'en' ? 'ml' : 'en')}
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm shadow-sm hover:border-gray-300"
                  title="Toggle language (English / Malayalam)"
                  whileTap={{ scale: 0.95 }}
                >
                  {language === 'ml' ? 'ML' : 'EN'}
                </motion.button>
                {/* Continuous mode toggle */}
                <motion.button
                  onClick={() => setContinuousMode(v => !v)}
                  className={`px-3 py-2 rounded-xl border text-sm shadow-sm ${continuousMode ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-700'} hover:border-gray-300`}
                  title="Continuous dictation"
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4" />
                    <span>Continuous</span>
                  </div>
                </motion.button>
                {/* Mic device selector */}
                <div className="min-w-[180px]">
                  <select
                    value={selectedMicId}
                    onChange={(e) => setSelectedMicId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm shadow-sm hover:border-gray-400"
                    title="Select microphone"
                  >
                    {micDevices.length === 0 && (
                      <option value="">Default microphone</option>
                    )}
                    {micDevices.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || 'Microphone'}
                      </option>
                    ))}
                  </select>
                </div>
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

                {/* Enhanced Text Input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    onKeyDown={(e) => {
                      // Escape to clear input
                      if (e.key === 'Escape') {
                        setCurrentMessage('');
                      }
                      // Ctrl+Enter to send (alternative)
                      if (e.key === 'Enter' && e.ctrlKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={isListening ? "Listening..." : "Type your message here or click the microphone to speak..."}
                    className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/95 backdrop-blur-sm transition-all duration-200 text-gray-800 placeholder-gray-500"
                    disabled={isListening || isStreaming}
                  />
                  {/* Character count indicator */}
                  {currentMessage.length > 0 && (
                    <div className="absolute bottom-1 right-3 text-xs text-gray-400">
                      {currentMessage.length}/500
                    </div>
                  )}
                  {/* Typing indicator */}
                  {currentMessage.length > 0 && !isListening && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </motion.div>
                  )}
                </div>

                {/* Enhanced Send Button */}
                <motion.button
                  onClick={handleSend}
                  disabled={!currentMessage.trim() || isListening || isStreaming}
                  className={`p-4 rounded-xl transition-all duration-200 shadow-lg ${
                    currentMessage.trim() 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-xl' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: currentMessage.trim() ? 1.05 : 1 }}
                  title={currentMessage.trim() ? "Send message" : "Type a message to send"}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
              {/* TTS Settings Panel */}
              <AnimatePresence>
                {showTtsSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mt-4 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-gray-700">Voice</label>
                        <select
                          value={ttsVoiceId}
                          onChange={(e) => setTtsVoiceId(e.target.value)}
                          className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm"
                        >
                          <option value="">Auto ({language === 'ml' ? 'Malayalam' : 'English'})</option>
                          {voices
                            .filter(v => v.lang?.toLowerCase().startsWith(language === 'ml' ? 'ml' : 'en'))
                            .map(v => (
                              <option key={v.voiceURI} value={v.voiceURI}>
                                {v.name} ({v.lang})
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-700">Rate: {ttsRate.toFixed(2)}</label>
                        <input
                          type="range"
                          min="0.7"
                          max="1.3"
                          step="0.05"
                          value={ttsRate}
                          onChange={(e) => setTtsRate(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-700">Pitch: {ttsPitch.toFixed(2)}</label>
                        <input
                          type="range"
                          min="0.8"
                          max="1.2"
                          step="0.05"
                          value={ttsPitch}
                          onChange={(e) => setTtsPitch(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <motion.button
                        onClick={() => speak(language === 'ml' ? 'ഇതാണ് ഒരു ശബ്ദ പരിശോധന.' : 'This is a voice test.')}
                        className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm shadow hover:bg-blue-700"
                        whileTap={{ scale: 0.97 }}
                      >
                        Test voice
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Enhanced Quick Actions with more typing prompts */}
              <div className="mt-4 space-y-3">
                <div className="text-sm text-gray-600 font-medium">💡 Quick prompts to try:</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { text: 'How am I doing?', prompt: 'How am I doing today with my recovery?', icon: '📊' },
                    { text: 'I need help', prompt: 'I need help and support right now', icon: '🆘' },
                    { text: 'Motivation', prompt: 'Give me some motivation and encouragement', icon: '💪' },
                    { text: 'Coping strategies', prompt: 'What are some good coping strategies I can use?', icon: '🧘' },
                    { text: 'Feeling anxious', prompt: 'I am feeling anxious and overwhelmed', icon: '😰' },
                    { text: 'Having cravings', prompt: 'I am having cravings and need help to resist them', icon: '🚫' },
                    { text: 'Daily check-in', prompt: 'I want to do my daily recovery check-in', icon: '✅' },
                    { text: 'Celebrate progress', prompt: 'I want to celebrate my progress in recovery', icon: '🎉' }
                  ].map((quickAction, index) => (
                    <motion.button
                      key={index}
                      onClick={() => {
                        if (isListening || isStreaming) return;
                        setCurrentMessage(quickAction.prompt);
                        // Auto-send after a short delay to show the text first
                        setTimeout(() => {
                          if (!isListening && !isStreaming) {
                            queryAI(quickAction.prompt);
                            setCurrentMessage('');
                          }
                        }, 300);
                      }}
                      className="px-3 py-2 text-sm bg-white/80 hover:bg-white border border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
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
        
        {/* Voice Assistant with Movable Avatar */}
        {showVoiceAssistant && (
          <VoiceAssistantSimple />
        )}
      </div>
    </div>
  )
}

export default Assistant
