import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wind, Heart, Activity, Timer, Target, BarChart3, Play, Pause, RotateCcw } from 'lucide-react'

// Heart Coherence & Breathing Biofeedback Component
const BreathingCoherence = ({ onComplete, isActive = false }) => {
  const [sessionActive, setSessionActive] = useState(false)
  const [breathingPhase, setBreathingPhase] = useState('inhale') // inhale, hold, exhale, pause
  const [cycleCount, setCycleCount] = useState(0)
  const [sessionTime, setSessionTime] = useState(0)
  const [coherenceScore, setCoherenceScore] = useState(0)
  const [hrv, setHRV] = useState(50) // Heart Rate Variability simulation
  const [breathingRate, setBreathingRate] = useState(6) // breaths per minute
  const [targetDuration, setTargetDuration] = useState(5) // minutes
  
  // Audio analysis for breathing detection
  const [audioContext, setAudioContext] = useState(null)
  const [analyser, setAnalyser] = useState(null)
  const [microphone, setMicrophone] = useState(null)
  const [audioData, setAudioData] = useState(new Uint8Array(0))
  
  const animationRef = useRef()
  const intervalRef = useRef()
  const phaseTimerRef = useRef()

  // Breathing pattern configurations
  const breathingPatterns = {
    coherent: { inhale: 5, hold: 0, exhale: 5, pause: 0, description: "5-5 Coherent Breathing" },
    box: { inhale: 4, hold: 4, exhale: 4, pause: 4, description: "4-4-4-4 Box Breathing" },
    relaxing: { inhale: 4, hold: 2, exhale: 6, pause: 2, description: "4-2-6-2 Relaxing" },
    energizing: { inhale: 6, hold: 2, exhale: 4, pause: 2, description: "6-2-4-2 Energizing" }
  }

  const [selectedPattern, setSelectedPattern] = useState('coherent')
  const currentPattern = breathingPatterns[selectedPattern]

  // Initialize audio context for microphone breathing detection
  useEffect(() => {
    if (sessionActive && !audioContext) {
      setupAudioAnalysis()
    }
    
    return () => {
      if (microphone) {
        microphone.getTracks().forEach(track => track.stop())
      }
      if (audioContext) {
        audioContext.close()
      }
    }
  }, [sessionActive])

  const setupAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        } 
      })
      
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const analyserNode = audioCtx.createAnalyser()
      const source = audioCtx.createMediaStreamSource(stream)
      
      analyserNode.fftSize = 2048
      source.connect(analyserNode)
      
      setAudioContext(audioCtx)
      setAnalyser(analyserNode)
      setMicrophone(stream)
      
      // Start audio analysis loop
      startAudioAnalysis(analyserNode)
    } catch (error) {
      console.warn('Microphone access denied or unavailable:', error)
    }
  }

  const startAudioAnalysis = (analyserNode) => {
    const bufferLength = analyserNode.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    
    const analyze = () => {
      if (!sessionActive) return
      
      analyserNode.getByteFrequencyData(dataArray)
      setAudioData(dataArray)
      
      // Detect breathing patterns from audio
      const breathingSignal = detectBreathing(dataArray)
      updateCoherenceScore(breathingSignal)
      
      animationRef.current = requestAnimationFrame(analyze)
    }
    
    analyze()
  }

  const detectBreathing = (audioData) => {
    // Simple breathing detection based on low-frequency audio patterns
    const lowFreqBins = audioData.slice(1, 20) // Focus on breathing frequency range
    const average = lowFreqBins.reduce((a, b) => a + b, 0) / lowFreqBins.length
    const variance = lowFreqBins.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / lowFreqBins.length
    
    return {
      amplitude: average,
      variance: variance,
      consistency: 1 / (1 + variance), // Higher consistency = lower variance
      timestamp: Date.now()
    }
  }

  const updateCoherenceScore = (breathingSignal) => {
    // Calculate coherence based on breathing consistency and rhythm
    const rhythmScore = breathingSignal.consistency * 100
    const amplitudeScore = Math.min(100, breathingSignal.amplitude)
    const currentScore = (rhythmScore + amplitudeScore) / 2
    
    // Smooth the coherence score
    setCoherenceScore(prev => prev * 0.8 + currentScore * 0.2)
    
    // Update HRV simulation based on breathing quality
    setHRV(prev => {
      const target = 50 + (currentScore - 50) * 0.5
      return prev * 0.9 + target * 0.1
    })
  }

  const startSession = () => {
    setSessionActive(true)
    setSessionTime(0)
    setCycleCount(0)
    setCoherenceScore(50)
    setBreathingPhase('inhale')
    
    // Start session timer
    intervalRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1)
    }, 1000)
    
    // Start breathing cycle
    startBreathingCycle()
  }

  const startBreathingCycle = () => {
    const phases = ['inhale', 'hold', 'exhale', 'pause'].filter(phase => currentPattern[phase] > 0)
    let currentPhaseIndex = 0
    
    const nextPhase = () => {
      if (!sessionActive) return
      
      const phase = phases[currentPhaseIndex]
      setBreathingPhase(phase)
      
      const duration = currentPattern[phase] * 1000
      
      phaseTimerRef.current = setTimeout(() => {
        currentPhaseIndex = (currentPhaseIndex + 1) % phases.length
        
        if (currentPhaseIndex === 0) {
          setCycleCount(prev => prev + 1)
        }
        
        nextPhase()
      }, duration)
    }
    
    nextPhase()
  }

  const endSession = () => {
    setSessionActive(false)
    clearInterval(intervalRef.current)
    clearTimeout(phaseTimerRef.current)
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    
    if (microphone) {
      microphone.getTracks().forEach(track => track.stop())
    }
    
    if (audioContext) {
      audioContext.close()
      setAudioContext(null)
    }
    
    // Call completion callback with session data
    if (onComplete) {
      onComplete({
        duration: sessionTime,
        cycles: cycleCount,
        averageCoherence: coherenceScore,
        pattern: selectedPattern
      })
    }
  }

  const getPhaseInstructions = () => {
    switch(breathingPhase) {
      case 'inhale':
        return { text: "Breathe In", color: "blue", instruction: "Fill your lungs slowly and deeply" }
      case 'hold':
        return { text: "Hold", color: "yellow", instruction: "Gently hold your breath" }
      case 'exhale':
        return { text: "Breathe Out", color: "green", instruction: "Release slowly and completely" }
      case 'pause':
        return { text: "Pause", color: "purple", instruction: "Rest before the next breath" }
    }
  }

  const phaseInfo = getPhaseInstructions()

  if (!sessionActive) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Wind className="text-blue-500" size={24} />
          <h3 className="text-xl font-bold">Heart Coherence Breathing</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Use guided breathing with biofeedback to achieve heart rate coherence and reduce stress.
        </p>
        
        {/* Pattern Selection */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-3 block">Breathing Pattern</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(breathingPatterns).map(([key, pattern]) => (
              <button
                key={key}
                onClick={() => setSelectedPattern(key)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  selectedPattern === key
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">{pattern.description}</div>
                <div className="text-sm text-gray-600">
                  {pattern.inhale}s in • {pattern.hold > 0 ? `${pattern.hold}s hold • ` : ''}{pattern.exhale}s out{pattern.pause > 0 ? ` • ${pattern.pause}s pause` : ''}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Duration Selection */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-3 block">Session Duration</label>
          <div className="flex gap-3">
            {[3, 5, 10, 15].map(minutes => (
              <button
                key={minutes}
                onClick={() => setTargetDuration(minutes)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  targetDuration === minutes
                    ? 'border-blue-400 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {minutes}m
              </button>
            ))}
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startSession}
          className="w-full p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <Play size={20} />
          Start Breathing Session
        </motion.button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 max-w-lg mx-4 text-center relative"
      >
        {/* Session Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={endSession}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <Pause size={20} />
          </button>
        </div>
        
        {/* Breathing Circle */}
        <div className="relative mb-8">
          <motion.div 
            className={`w-64 h-64 mx-auto rounded-full border-8 border-${phaseInfo.color}-300 bg-gradient-to-br from-${phaseInfo.color}-50 to-${phaseInfo.color}-100 flex items-center justify-center`}
            animate={{
              scale: breathingPhase === 'inhale' ? 1.2 : breathingPhase === 'exhale' ? 0.8 : 1,
              borderColor: `var(--${phaseInfo.color}-400)`
            }}
            transition={{
              duration: currentPattern[breathingPhase],
              ease: "easeInOut"
            }}
          >
            <div className={`text-6xl font-bold text-${phaseInfo.color}-600`}>
              {breathingPhase === 'inhale' ? '↑' : 
               breathingPhase === 'exhale' ? '↓' : 
               breathingPhase === 'hold' ? '◦' : '◦'}
            </div>
          </motion.div>
          
          {/* Coherence Ring */}
          <motion.div 
            className="absolute inset-0 rounded-full border-4 border-green-400"
            style={{
              background: `conic-gradient(from 0deg, #10b981 ${coherenceScore * 3.6}deg, transparent ${coherenceScore * 3.6}deg)`
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        </div>
        
        {/* Phase Instructions */}
        <div className="mb-6">
          <h3 className={`text-3xl font-bold text-${phaseInfo.color}-600 mb-2`}>
            {phaseInfo.text}
          </h3>
          <p className="text-gray-600">{phaseInfo.instruction}</p>
        </div>
        
        {/* Biofeedback Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{Math.round(coherenceScore)}</div>
            <div className="text-xs text-gray-600">Coherence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{Math.round(hrv)}</div>
            <div className="text-xs text-gray-600">HRV</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{cycleCount}</div>
            <div className="text-xs text-gray-600">Cycles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-600">Time</div>
          </div>
        </div>
        
        {/* Audio Visualization */}
        {audioData.length > 0 && (
          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-2">Breathing Detection</div>
            <div className="flex items-end justify-center gap-1 h-12">
              {Array.from(audioData.slice(1, 21)).map((value, index) => (
                <motion.div
                  key={index}
                  className="w-2 bg-blue-400 rounded-t"
                  style={{ height: `${(value / 255) * 48}px` }}
                  animate={{ height: `${(value / 255) * 48}px` }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Progress */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${(sessionTime / (targetDuration * 60)) * 100}%` }}
          />
        </div>
        
        <button
          onClick={endSession}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          End Session
        </button>
      </motion.div>
    </div>
  )
}

export default BreathingCoherence
