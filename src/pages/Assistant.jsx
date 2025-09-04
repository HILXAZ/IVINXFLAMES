import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Send, Mic, Square, Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import OppenheimerBackground from '../components/OppenheimerBackground'

// Enhanced AI Avatar Component with Ultra-Realistic Features
const AnimatedAvatar = ({ speaking, listening, locale }) => {
  const [avatarMode, setAvatarMode] = useState('robot') // 'robot' | 'realistic' | 'hologram' | 'german'
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
        const modes = ['german', 'robot', 'realistic', 'hologram']
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
      
    {(avatarMode === 'robot' || avatarMode === 'german') && (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Advanced Robotic AI Face */}
      <div className={`relative w-28 h-28 rounded-2xl shadow-inner border-2 ${avatarMode === 'german' ? 'bg-gradient-to-br from-gray-100 via-emerald-100 to-teal-200 border-emerald-500' : 'bg-gradient-to-br from-gray-100 via-blue-100 to-indigo-200 border-blue-400'}`}>
            
            {/* Robot Head Top with Advanced Antenna */}
            <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-6 rounded-t-xl border ${avatarMode === 'german' ? 'bg-gradient-to-b from-emerald-400 to-teal-600 border-emerald-600' : 'bg-gradient-to-b from-blue-400 to-blue-600 border-blue-500'}`}>
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-cyan-300 rounded-full">
                <motion.div 
                  className="w-full h-full bg-cyan-400 rounded-full"
                  animate={{ 
                    boxShadow: speaking ? 
                      [
                        `0 0 5px ${avatarMode === 'german' ? '#059669' : '#06b6d4'}`,
                        `0 0 15px ${avatarMode === 'german' ? '#0ea5a3' : '#3b82f6'}`,
                        `0 0 5px ${avatarMode === 'german' ? '#059669' : '#06b6d4'}`
                      ] :
                      listening ?
                      [
                        `0 0 5px ${avatarMode === 'german' ? '#0ea5a3' : '#10b981'}`,
                        `0 0 10px ${avatarMode === 'german' ? '#10b981' : '#10b981'}`,
                        `0 0 5px ${avatarMode === 'german' ? '#0ea5a3' : '#10b981'}`
                      ] :
                      `0 0 3px ${avatarMode === 'german' ? '#0ea5a3' : '#06b6d4'}`
                  }}
                  transition={{ duration: 0.5, repeat: (speaking || listening) ? Infinity : 0 }}
                />
              </div>
              {/* Signal waves */}
              {(speaking || listening) && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-6 h-6 border-2 rounded-full"
                      style={{
                        borderColor: speaking ? '#3b82f6' : '#10b981',
                        left: '-12px',
                        top: '-12px'
                      }}
                      animate={{
                        scale: [0, 2],
                        opacity: [0.8, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Enhanced Digital Display Eyes */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex gap-3">
              <motion.div 
        className={`w-6 h-5 rounded-lg border-2 flex items-center justify-center shadow-lg ${avatarMode === 'german' ? 'bg-gradient-to-br from-emerald-300 to-teal-500 border-emerald-500' : 'bg-gradient-to-br from-cyan-300 to-blue-500 border-blue-500'}`}
                animate={{ 
                  opacity: eyeState === 'blink' ? 0.3 : 1,
                  scaleY: eyeState === 'blink' ? 0.2 : 1,
                  boxShadow: speaking ? 
                    ['0 0 5px #3b82f6', '0 0 15px #06b6d4', '0 0 5px #3b82f6'] :
                    listening ?
                    ['0 0 5px #10b981', '0 0 10px #10b981', '0 0 5px #10b981'] :
                    '0 0 8px #3b82f6'
                }}
                transition={{ duration: eyeState === 'blink' ? 0.1 : 0.3, repeat: (speaking || listening) ? Infinity : 0 }}
              >
                <motion.div 
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{
                    scale: speaking ? [1, 1.2, 1] : 1
                  }}
                  transition={{ duration: 0.3, repeat: speaking ? Infinity : 0 }}
                />
              </motion.div>
              
              <motion.div 
                className={`w-6 h-5 rounded-lg border-2 flex items-center justify-center shadow-lg ${avatarMode === 'german' ? 'bg-gradient-to-br from-emerald-300 to-teal-500 border-emerald-500' : 'bg-gradient-to-br from-cyan-300 to-blue-500 border-blue-500'}`}
                animate={{ 
                  opacity: eyeState === 'blink' ? 0.3 : 1,
                  scaleY: eyeState === 'blink' ? 0.2 : 1,
                  boxShadow: speaking ? 
                    ['0 0 5px #3b82f6', '0 0 15px #06b6d4', '0 0 5px #3b82f6'] :
                    listening ?
                    ['0 0 5px #10b981', '0 0 10px #10b981', '0 0 5px #10b981'] :
                    '0 0 8px #3b82f6'
                }}
                transition={{ duration: eyeState === 'blink' ? 0.1 : 0.3, repeat: (speaking || listening) ? Infinity : 0 }}
              >
                <motion.div 
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{
                    scale: speaking ? [1, 1.2, 1] : 1
                  }}
                  transition={{ duration: 0.3, repeat: speaking ? Infinity : 0 }}
                />
              </motion.div>
            </div>
            
            {/* Enhanced Speaker Grille Mouth with Lip Movement */}
            <motion.div 
              className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 w-10 h-6 bg-gradient-to-br rounded-lg border-2 shadow-inner overflow-hidden ${avatarMode === 'german' ? 'from-gray-600 to-gray-800 border-emerald-700' : 'from-gray-600 to-gray-800 border-gray-700'}`}
              animate={{
                borderColor: speaking ? 
                  ['#3b82f6', '#06b6d4', '#3b82f6'] :
                  listening ?
                  ['#10b981', '#34d399', '#10b981'] :
                  '#374151',
                boxShadow: speaking ? 
                  ['inset 0 0 5px #3b82f6', 'inset 0 0 15px #06b6d4', 'inset 0 0 5px #3b82f6'] :
                  listening ?
                  ['inset 0 0 5px #10b981', 'inset 0 0 10px #10b981', 'inset 0 0 5px #10b981'] :
                  'inset 0 0 3px #374151',
                // Lip movement - mouth shape changes
                scaleX: speaking ? [1, 1.2, 0.9, 1.1, 1] : 1,
                scaleY: speaking ? [1, 0.8, 1.3, 0.9, 1] : 1,
                borderRadius: speaking ? 
                  ['8px', '12px', '6px', '10px', '8px'] : '8px'
              }}
              transition={{ 
                duration: speaking ? 0.15 : 0.3, 
                repeat: speaking ? Infinity : 0,
                ease: speaking ? "easeInOut" : "linear"
              }}
            >
              {/* Upper lip */}
              <motion.div 
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-500 to-gray-600 rounded-t-lg"
                animate={{
                  scaleY: speaking ? [1, 0.5, 1.5, 0.8, 1] : 1,
                  opacity: speaking ? [0.8, 1, 0.6, 0.9, 0.8] : 0.7
                }}
                transition={{ 
                  duration: speaking ? 0.12 : 0,
                  repeat: speaking ? Infinity : 0,
                  ease: "easeInOut"
                }}
              />
              
              {/* Lower lip */}
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-500 to-gray-600 rounded-b-lg"
                animate={{
                  scaleY: speaking ? [1, 1.2, 0.7, 1.1, 1] : 1,
                  opacity: speaking ? [0.8, 0.9, 1, 0.7, 0.8] : 0.7
                }}
                transition={{ 
                  duration: speaking ? 0.14 : 0,
                  repeat: speaking ? Infinity : 0,
                  ease: "easeInOut",
                  delay: 0.05
                }}
              />
              
              {/* Dynamic speaker lines with speech patterns */}
              <div className="absolute inset-2 flex flex-col gap-1">
                {[...Array(4)].map((_, i) => (
                  <motion.div 
                    key={i}
                    className="h-0.5 rounded-full"
                    style={{
                      background: speaking ? 
                        'linear-gradient(to right, #3b82f6, #06b6d4)' :
                        listening ?
                        'linear-gradient(to right, #10b981, #34d399)' :
                        'linear-gradient(to right, #6b7280, #9ca3af)'
                    }}
                    animate={{
                      opacity: speaking ? 
                        // Simulate speech patterns with varying intensities
                        i === 0 ? [0.4, 1, 0.2, 0.8, 0.4] :
                        i === 1 ? [0.6, 0.3, 1, 0.5, 0.6] :
                        i === 2 ? [0.3, 0.9, 0.4, 1, 0.3] :
                        [0.8, 0.4, 0.7, 0.3, 0.8] : 
                        listening ? [0.6, 1, 0.6] : 0.7,
                      scaleX: speaking ? 
                        // Different line movements for speech realism
                        i === 0 ? [0.8, 1.4, 0.6, 1.2, 0.8] :
                        i === 1 ? [1, 0.7, 1.5, 0.9, 1] :
                        i === 2 ? [0.9, 1.3, 0.8, 1.1, 0.9] :
                        [1.1, 0.8, 1.2, 0.7, 1.1] : 
                        listening ? [0.9, 1.1, 0.9] : 1,
                      scaleY: speaking ? 
                        // Vertical movement for phoneme simulation
                        i % 2 === 0 ? [0.5, 2.5, 0.8, 1.8, 0.5] : [1, 0.6, 2.2, 0.7, 1] : 1
                    }}
                    transition={{ 
                      duration: speaking ? 0.08 + (i * 0.02) : 0.5, 
                      repeat: (speaking || listening) ? Infinity : 0,
                      delay: speaking ? i * 0.03 : i * 0.1,
                      ease: speaking ? "easeInOut" : "linear"
                    }}
                  />
                ))}
              </div>
              
              {/* Center vocal cord simulation */}
              <motion.div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                style={{
                  background: speaking ? '#3b82f6' : listening ? '#10b981' : '#6b7280'
                }}
                animate={{
                  scale: speaking ? [1, 2.5, 0.8, 1.8, 1] : listening ? [1, 1.5, 1] : 1,
                  opacity: speaking ? [0.8, 1, 0.5, 0.9, 0.8] : listening ? [0.8, 1, 0.8] : 0.6,
                  // Simulate vocal vibration
                  y: speaking ? [0, -1, 1, -0.5, 0] : 0
                }}
                transition={{ 
                  duration: speaking ? 0.1 : 0.4, 
                  repeat: (speaking || listening) ? Infinity : 0,
                  ease: speaking ? "easeInOut" : "linear"
                }}
              />
              
              {/* Speech breath effect */}
              {speaking && (
                <motion.div 
                  className="absolute inset-0 bg-blue-400/20 rounded-lg"
                  animate={{
                    opacity: [0, 0.3, 0, 0.2, 0],
                    scale: [1, 1.05, 1, 1.03, 1]
                  }}
                  transition={{ 
                    duration: 0.2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </motion.div>
            
            {/* Central status indicator */}
            <motion.div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
              style={{
                background: speaking ? '#3b82f6' : listening ? '#10b981' : '#6b7280'
              }}
              animate={{
                scale: speaking ? [1, 2, 1] : listening ? [1, 1.5, 1] : 1,
                opacity: speaking ? [0.8, 1, 0.8] : listening ? [0.8, 1, 0.8] : 0.6
              }}
              transition={{ duration: 0.4, repeat: (speaking || listening) ? Infinity : 0 }}
            />
            
            {/* Enhanced Status LEDs */}
            <div className="absolute bottom-2 left-2 flex gap-2">
              <motion.div 
                className="w-2 h-2 rounded-full border"
                style={{
                  backgroundColor: listening ? '#10b981' : '#6b7280',
                  borderColor: listening ? '#059669' : '#4b5563'
                }}
                animate={{
                  scale: listening ? [1, 1.3, 1] : 1,
                  boxShadow: listening ? 
                    ['0 0 3px #10b981', '0 0 8px #10b981', '0 0 3px #10b981'] :
                    '0 0 2px #6b7280'
                }}
                transition={{ duration: 0.8, repeat: listening ? Infinity : 0 }}
              />
              <motion.div 
                className="w-2 h-2 rounded-full border"
                style={{
                  backgroundColor: speaking ? '#3b82f6' : '#6b7280',
                  borderColor: speaking ? '#1d4ed8' : '#4b5563'
                }}
                animate={{
                  scale: speaking ? [1, 1.3, 1] : 1,
                  boxShadow: speaking ? 
                    ['0 0 3px #3b82f6', '0 0 8px #3b82f6', '0 0 3px #3b82f6'] :
                    '0 0 2px #6b7280'
                }}
                transition={{ duration: 0.5, repeat: speaking ? Infinity : 0 }}
              />
            </div>
            
            {/* Processing indicator */}
            <div className="absolute top-2 right-2">
              <motion.div 
                className="w-3 h-3 rounded-full"
                style={{
                  background: speaking ? (avatarMode === 'german' ? '#0ea5a3' : '#f59e0b') : listening ? '#10b981' : '#6b7280'
                }}
                animate={{
                  rotate: (speaking || listening) ? 360 : 0,
                  scale: (speaking || listening) ? [1, 1.2, 1] : 1
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: (speaking || listening) ? Infinity : 0, ease: "linear" },
                  scale: { duration: 0.5, repeat: (speaking || listening) ? Infinity : 0 }
                }}
              />
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
        {avatarMode === 'german' ? 'German Robot' : `${avatarMode} Mode`}
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
        max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg backdrop-blur-xl
        ${isUser 
          ? 'bg-gradient-to-r from-blue-500/90 to-purple-600/90 text-white rounded-br-md border border-blue-300/30' 
          : 'bg-white/20 text-white border border-white/30 rounded-bl-md shadow-xl'
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
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [autoListen, setAutoListen] = useState(true)
  const [language, setLanguage] = useState('en-US') // 'en-US' | 'ml-IN'
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const synthesisRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const recordedChunksRef = useRef([])
  const [micPermission, setMicPermission] = useState('unknown') // 'unknown' | 'granted' | 'denied'
  const [forceCloudSTT, setForceCloudSTT] = useState(false)
  const [aiResponseQuality, setAiResponseQuality] = useState('high') // 'high' | 'medium' | 'fallback'
  const [conversationSummary, setConversationSummary] = useState('')

  // Enhanced AI Query function with improved responses and better error handling
  const queryAI = useCallback(async (prompt) => {
    console.log('🤖 ENHANCED AI QUERY STARTED')
    console.log('📝 Received prompt:', prompt)
    
    if (!prompt || !prompt.trim()) {
      console.log('❌ Empty prompt received')
      setError('❌ Please enter a message')
      return
    }
    
    setError('')
    setIsStreaming(true)
    setCurrentStreamContent('')
    
    // Add user message immediately
    setMessages(prev => [...prev, { text: prompt, isUser: true, timestamp: new Date() }])
    
    try {
      // Enhanced Gemini API implementation
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY
      
      if (geminiKey && geminiKey !== 'your-gemini-api-key-here') {
        console.log('🔑 Using Gemini API with enhanced prompting...')
        
        const contextualPrompt = `You are an expert AI Recovery Coach and Addiction Counselor with deep knowledge of psychology, addiction recovery, and therapeutic techniques.

CONVERSATION CONTEXT: ${messages.length > 0 ? `Previous messages in this conversation: ${messages.slice(-4).map(m => `${m.isUser ? 'User' : 'Coach'}: ${m.text}`).join(' | ')}` : 'This is the start of our conversation.'}

USER'S CURRENT MESSAGE: "${prompt}"

CONTEXT: This person is on their recovery journey and needs:
- Empathetic understanding and validation
- Practical, actionable advice
- Hope and encouragement
- Evidence-based coping strategies
- Crisis support when needed

RESPONSE GUIDELINES:
1. Reference our conversation history if relevant
2. Always acknowledge their feelings first
3. Provide specific, practical advice they can use immediately
4. Include recovery-focused strategies (mindfulness, grounding techniques, etc.)
5. Use warm, encouraging but realistic language
6. If they express crisis/suicidal thoughts, provide immediate resources
7. Keep response 3-5 sentences, clear and actionable
8. End with a supportive question or encouragement

${language.startsWith('ml') ? 'Respond in Malayalam (ml-IN).' : 'Respond in English (en-US).'}

Be their supportive companion who truly understands recovery challenges and remembers our ongoing conversation.`

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: contextualPrompt }]
            }],
            generationConfig: {
              temperature: 0.85,
              maxOutputTokens: 400,
              topP: 0.9,
              topK: 40
            }
          })
        })

        if (response.ok) {
          const data = await response.json()
          const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
          
          if (aiResponse && aiResponse.trim()) {
            console.log('✅ Gemini response received:', aiResponse)
            setAiResponseQuality('high')
            await streamResponse(aiResponse)
            return
          }
        } else {
          console.log('❌ Gemini API failed:', response.status)
          const errorText = await response.text()
          console.log('Error details:', errorText)
        }
      }

      // Enhanced fallback with local AI server
      try {
        console.log('🌐 Trying enhanced server AI...')
        const serverRes = await fetch('/api/coach/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { 
                role: 'system', 
                content: 'You are a compassionate AI Recovery Coach. Provide supportive, practical advice for addiction recovery. Be empathetic, encouraging, and offer specific coping strategies.' 
              },
              { role: 'user', content: prompt }
            ],
            stream: false,
            max_tokens: 300,
            temperature: 0.8
          })
        })
        
        if (serverRes.ok) {
          const data = await serverRes.json()
          const aiText = data?.choices?.[0]?.message?.content || data?.response
          if (aiText && aiText.trim()) {
            console.log('✅ Server AI response received')
            setAiResponseQuality('medium')
            await streamResponse(aiText)
            return
          }
        }
      } catch (serverErr) {
        console.log('🌐 Server AI error:', serverErr.message)
      }

      // Enhanced intelligent fallback responses based on sentiment analysis
      const enhancedResponse = generateIntelligentFallback(prompt)
      setAiResponseQuality('fallback')
      await streamResponse(enhancedResponse)
      
    } catch (error) {
      console.error('❌ AI query failed:', error)
      setIsStreaming(false)
      setCurrentStreamContent('')
      
      const errorResponse = "I'm experiencing some technical difficulties, but I'm still here for you. Recovery is a journey that requires courage, and reaching out shows your strength. How are you feeling right now, and what kind of support would help you most?"
      
      setMessages(prev => [...prev, { text: errorResponse, isUser: false, timestamp: new Date() }])
      setTimeout(() => speakText(errorResponse), 500)
    }
  }, [language])

  // Helper function to stream responses with better timing
  const streamResponse = async (text) => {
    setCurrentStreamContent('')
    const words = text.split(' ')
    let currentText = ''
    
    for (let i = 0; i < words.length; i++) {
      currentText += words[i] + ' '
      setCurrentStreamContent(currentText.trim())
      await new Promise(resolve => setTimeout(resolve, 40)) // Faster streaming
    }
    
    setIsStreaming(false)
    setCurrentStreamContent('')
    setMessages(prev => [...prev, { text: text, isUser: false, timestamp: new Date() }])
    
    // Speak the response
    setTimeout(() => speakText(text), 300)
  }

  // Enhanced intelligent fallback with sentiment analysis
  const generateIntelligentFallback = (prompt) => {
    const lowerPrompt = prompt.toLowerCase()
    
    // Crisis detection
    if (lowerPrompt.includes('suicide') || lowerPrompt.includes('kill myself') || lowerPrompt.includes('end it all')) {
      return "I'm deeply concerned about you right now. Your life has value and you matter. Please reach out for immediate help: Call 988 (Suicide & Crisis Lifeline) or text HOME to 741741. You don't have to face this alone - there are people who want to help you through this difficult time."
    }
    
    // Emotional state responses
    if (lowerPrompt.includes('relapse') || lowerPrompt.includes('used') || lowerPrompt.includes('drank')) {
      return "I hear you, and I want you to know that relapses don't erase your progress - they're often part of the recovery journey. What matters most is that you're reaching out now. Can you get to a safe place and call your sponsor or a trusted friend? Remember: this moment doesn't define you, your response to it does."
    }
    
    if (lowerPrompt.includes('craving') || lowerPrompt.includes('urge') || lowerPrompt.includes('want to use')) {
      return "Cravings are like waves - they feel overwhelming but they do pass. Try the HALT check: Are you Hungry, Angry, Lonely, or Tired? Address what you can immediately. Use grounding techniques: name 5 things you see, 4 you hear, 3 you feel. You've resisted cravings before, and you have that same strength right now."
    }
    
    if (lowerPrompt.includes('anxious') || lowerPrompt.includes('anxiety') || lowerPrompt.includes('panic')) {
      return "Anxiety in recovery is common and manageable. Try the 4-7-8 breathing technique: breathe in for 4, hold for 7, exhale for 8. Remind yourself: 'This feeling is temporary and I am safe.' What's one small thing you can do right now to feel more grounded?"
    }
    
    if (lowerPrompt.includes('depressed') || lowerPrompt.includes('sad') || lowerPrompt.includes('hopeless')) {
      return "I hear the pain in your words, and I want you to know that these feelings, while real and valid, are not permanent. Depression often lies to us about our worth and future. You've shown incredible strength by reaching out. What's one tiny step you could take today, even if it's just drinking a glass of water or stepping outside?"
    }
    
    if (lowerPrompt.includes('angry') || lowerPrompt.includes('frustrated') || lowerPrompt.includes('mad')) {
      return "Anger is a valid emotion, and it often signals that something important is happening. In recovery, anger can be redirected into positive action. Try physical release: go for a walk, do jumping jacks, or punch a pillow. What do you think your anger is trying to tell you right now?"
    }
    
    if (lowerPrompt.includes('lonely') || lowerPrompt.includes('isolated') || lowerPrompt.includes('alone')) {
      return "Loneliness in recovery is one of the hardest challenges, but you're not actually alone - you're here talking with me, which shows your strength. Consider reaching out to one person today, even with a simple text. Recovery communities, both online and offline, are full of people who understand exactly what you're experiencing."
    }
    
    if (lowerPrompt.includes('grateful') || lowerPrompt.includes('thankful') || lowerPrompt.includes('appreciate')) {
      return "Gratitude is such a powerful tool in recovery! It's wonderful that you're recognizing positive things in your life. Gratitude rewires our brains to notice more good things. What are three specific things you're grateful for today, no matter how small they might seem?"
    }
    
    if (lowerPrompt.includes('motivation') || lowerPrompt.includes('inspire') || lowerPrompt.includes('encourage')) {
      return "You're asking for motivation, which tells me you haven't given up - that's already a victory! Remember: recovery isn't about being perfect, it's about being persistent. Every day you choose healing over hurting is a day you're rewriting your story. What's one thing you can do today that your future self will thank you for?"
    }
    
    // Support seeking
    if (lowerPrompt.includes('help') || lowerPrompt.includes('support') || lowerPrompt.includes('need')) {
      return "Asking for help is one of the bravest and strongest things you can do in recovery. You're not weak for needing support - you're human, and humans heal in community. What specific kind of support would be most helpful for you right now? Remember, there are people who want to help you succeed."
    }
    
    // Progress and reflection
    if (lowerPrompt.includes('progress') || lowerPrompt.includes('better') || lowerPrompt.includes('improving')) {
      return "It's amazing that you're recognizing your progress! Recovery happens in small steps, and celebrating these wins - no matter how small - is crucial for building momentum. What specific changes have you noticed in yourself? Keep building on these positive changes, one day at a time."
    }
    
    // Default supportive response
    return "Thank you for sharing that with me. Recovery is a courageous journey, and the fact that you're here, reaching out and engaging in conversation, shows your commitment to healing. Every conversation, every moment of self-reflection, every small step forward matters. What's most important for you to focus on right now in your recovery journey?"
  }

  // TEXT-TO-SPEECH FUNCTIONALITY
  const speakText = useCallback((text) => {
    if (!voiceEnabled || !text || text.trim() === '') return

    // Stop any current speech
    if (synthesisRef.current) {
      window.speechSynthesis.cancel()
    }

    console.log('🗣️ SPEAKING:', text)
    setIsSpeaking(true)

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = language
    
    // Configure voice settings for better quality
    utterance.rate = 0.9
    utterance.pitch = 1.1
    utterance.volume = 0.8
    
    // Try to choose a voice that matches the selected language
    const voices = window.speechSynthesis.getVoices()
    let chosenVoice = null
    if (language.startsWith('ml')) {
      chosenVoice = voices.find(v => (v.lang?.toLowerCase().startsWith('ml')))
    }
    if (!chosenVoice) {
      chosenVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Karen') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Zira')
      )
    }
    if (chosenVoice) utterance.voice = chosenVoice

    utterance.onstart = () => {
      console.log('🎤 Speech started')
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      console.log('🎤 Speech ended')
      setIsSpeaking(false)
      synthesisRef.current = null
      // Auto re-listen after speaking ends
      if (autoListen && micPermission === 'granted' && !isListening) {
        setTimeout(() => {
          try { handleStart() } catch (_) {}
        }, 350)
      }
    }

    utterance.onerror = (e) => {
      console.error('🚫 Speech error:', e)
      setIsSpeaking(false)
      synthesisRef.current = null
    }

    synthesisRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [voiceEnabled, autoListen, micPermission, isListening, language])

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    synthesisRef.current = null
  }, [])

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentStreamContent])

  // Enhanced welcome message with more personalization
  useEffect(() => {
    if (!loading && user) {
      const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'there'
      const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'
      
      const welcomeMessage = `Good ${timeOfDay}, ${userName}! I'm your AI Recovery Coach, here to support you 24/7 on your journey. Whether you need encouragement, coping strategies, or just someone to listen, I'm here for you. How are you feeling today, and what would be most helpful for you right now?`
      
      setMessages([{ text: welcomeMessage, isUser: false, timestamp: new Date() }])
      
      // Speak welcome message after a brief delay
      setTimeout(() => {
        speakText(welcomeMessage)
      }, 2000)
    }
  }, [user, loading, speakText])

  // Detect microphone permission (best-effort)
  useEffect(() => {
    const detect = async () => {
      try {
        if (navigator.permissions?.query) {
          const status = await navigator.permissions.query({ name: 'microphone' })
          setMicPermission(status.state)
          status.onchange = () => setMicPermission(status.state)
        }
      } catch (_) { /* ignore */ }
    }
    detect()
  }, [])

  const requestMicPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(t => t.stop())
      setMicPermission('granted')
      setError('✅ Microphone enabled!')
      return true
    } catch (e) {
      setMicPermission('denied')
      setError('🚫 Microphone permission denied. Please allow access in the browser.')
      return false
    }
  }, [])

  // ENHANCED Speech Recognition Setup with better reliability
  const setupSpeechRecognition = useCallback(() => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      setError('🚫 Speech recognition not supported. Using cloud backup...')
      return null
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    // OPTIMIZED CONFIGURATION for maximum reliability
    recognition.lang = language
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.continuous = false
    
    let timeoutId
    let hasDetectedSpeech = false
    let finalTranscript = ''
    let hasSubmitted = false
    
    recognition.onstart = () => {
      console.log('🎤 Enhanced speech recognition started')
      setIsListening(true)
      setError('🎤 Listening... Speak clearly and naturally!')
      hasDetectedSpeech = false
      finalTranscript = ''
      hasSubmitted = false
      
      // Stop any current speech
      if (isSpeaking) {
        stopSpeaking()
      }
      
      // Timeout for no speech detected
      timeoutId = setTimeout(() => {
        if (!hasDetectedSpeech) {
          console.log('⏰ No speech detected within timeout')
          recognition.stop()
          setError('🔇 No speech detected. Please try again and speak louder.')
        }
      }, 8000) // Extended timeout
    }
    
    recognition.onsoundstart = () => {
      console.log('🔊 Sound detected - processing audio')
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      setError('🔊 Sound detected! Continue speaking...')
    }
    
    recognition.onspeechstart = () => {
      console.log('🗣️ Speech detected - analyzing')
      hasDetectedSpeech = true
      setError('🗣️ Speech detected! Keep talking naturally...')
    }
    
    // ENHANCED result processing with better accuracy
    recognition.onresult = (event) => {
      console.log('📝 Processing speech results...', event.results.length)
      let interimTranscript = ''
      let newFinalTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript.trim()
        const confidence = result[0].confidence
        
        console.log(`Result ${i}: "${transcript}" (confidence: ${confidence})`)
        
        if (result.isFinal) {
          newFinalTranscript += transcript
          console.log('✅ Final result:', transcript)
        } else {
          interimTranscript += transcript
        }
      }
      
      // Show interim results immediately
      if (interimTranscript) {
        setError(`Hearing: "${interimTranscript}"`)
        setCurrentMessage(interimTranscript)
      }
      
      // Process final results with confidence check
      if (newFinalTranscript && !hasSubmitted) {
        finalTranscript = newFinalTranscript
        console.log('✅ Processing final transcript:', finalTranscript)
        
        // Check if transcript is meaningful (not just noise)
        if (finalTranscript.length > 2 && finalTranscript !== 'undefined') {
          setCurrentMessage(finalTranscript)
          setError('✅ Speech recognized! Processing your message...')
          
          recognition.stop()
          hasSubmitted = true
          
          // Send to AI with slight delay
          setTimeout(() => {
            if (finalTranscript.trim()) {
              console.log('🤖 Sending to AI:', finalTranscript)
              queryAI(finalTranscript)
              setCurrentMessage('')
            }
          }, 500)
        } else {
          setError('🔇 Speech unclear. Please try again.')
        }
      }
    }
    
    // Enhanced error handling with specific solutions
    recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error)
      setIsListening(false)
      
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      
      const errorSolutions = {
        'network': '🌐 Network error. Please check your internet connection and try again.',
        'not-allowed': '🚫 Microphone access denied. Please allow microphone permission in your browser settings.',
        'no-speech': '🔇 No speech detected. Please speak louder and closer to your microphone.',
        'audio-capture': '🎤 Cannot access microphone. Please check if another app is using it.',
        'service-not-allowed': '🚫 Speech service blocked. Please check your browser settings.',
        'bad-grammar': '🗣️ Speech unclear. Please try speaking more slowly and clearly.',
        'aborted': '⏹️ Speech recognition was stopped.',
        'language-not-supported': '🌐 Selected language not supported. Switching to English.',
        'no-match': '❓ Could not understand speech. Please try again with clearer pronunciation.'
      }
      
      const errorMessage = errorSolutions[event.error] || `❌ Speech error: ${event.error}. Please try again.`
      setError(errorMessage)
      
      // Auto-retry for certain errors
      if (event.error === 'no-speech' || event.error === 'aborted') {
        setTimeout(() => {
          setError('🎤 Ready to listen again. Click the microphone to try once more.')
        }, 2000)
      }
    }
    
    recognition.onend = () => {
      console.log('⏹️ Speech recognition ended')
      setIsListening(false)
      
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      
      // Final processing if we have good transcript
      if (finalTranscript.trim() && !hasSubmitted && finalTranscript.length > 2) {
        console.log('🔄 Final processing on end:', finalTranscript)
        hasSubmitted = true
        setError('🤖 Processing your message...')
        queryAI(finalTranscript)
        setCurrentMessage('')
      } else if (!hasDetectedSpeech) {
        setError('🎤 Click the microphone to try speaking again.')
      }
    }
    
    return recognition
  }, [isStreaming, isSpeaking, stopSpeaking, language, queryAI])

  // Cloud STT fallback using our server proxy (Deepgram)
  const startCloudSTT = useCallback(async () => {
    try {
      setError('☁️ Using cloud speech recognition...')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      recordedChunksRef.current = []
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        try {
          const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm;codecs=opus' })
          const arrayBuffer = await blob.arrayBuffer()
          const resp = await fetch(`/api/stt/deepgram?lang=${encodeURIComponent(language)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'audio/webm;codecs=opus' },
            body: arrayBuffer
          })
          if (!resp.ok) {
            const text = await resp.text()
            setError(`☁️ STT failed: ${text}`)
            return
          }
          const { transcript } = await resp.json()
          if (transcript && transcript.trim()) {
            setCurrentMessage(transcript.trim())
            queryAI(transcript.trim())
            setError('✅ Transcribed via cloud STT')
          } else {
            setError('❓ No speech recognized. Try again.')
          }
        } catch (e) {
          setError(`☁️ STT error: ${e.message}`)
        } finally {
          stream.getTracks().forEach(t => t.stop())
        }
      }

      // Record 6 seconds max or until user stops mic
      recorder.start()
      setIsListening(true)
      setError('🎤 Recording for transcription...')
      setTimeout(() => {
        if (recorder.state !== 'inactive') recorder.stop()
        setIsListening(false)
      }, 6000)
    } catch (e) {
      setError(`🎤 Cloud STT init failed: ${e.message}`)
    }
  }, [queryAI, language])

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
    // Ensure permission first
    if (micPermission !== 'granted') {
      const ok = await requestMicPermission()
      if (!ok) return
    }

    // Force cloud STT if toggle is on or browser STT not available
    if (forceCloudSTT || !recognitionRef.current) {
      await startCloudSTT()
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
        
        // Relaxed gating: never block on low levels; warn and continue
        if (!audioDetected && maxLevel < 2) {
          setError('🎤 Very low input detected. Continuing anyway—please speak closer to the mic.')
        } else if (maxLevel < 5) {
          setError('🎤 Low audio levels detected. Please speak louder or closer to your microphone.')
        } else {
          setError('✅ Microphone test successful! Starting speech recognition...')
        }
        
        // Start speech recognition after test
        setTimeout(() => {
          try {
            if (recognitionRef.current && !language.startsWith('ml')) {
              try { recognitionRef.current.start() }
              catch (_e) { startCloudSTT() }
            } else { startCloudSTT() }
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

  // (queryAI moved up)

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
    <OppenheimerBackground>
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Language Selector (English / Malayalam) */}
        <div className="max-w-4xl mx-auto mb-4 flex justify-end">
          <div className="inline-flex bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden shadow-sm">
            <button
              className={`px-3 py-1.5 text-sm ${language === 'en-US' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-white'}`}
              onClick={() => setLanguage('en-US')}
            >EN</button>
            <button
              className={`px-3 py-1.5 text-sm ${language === 'ml-IN' ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-white'}`}
              onClick={() => setLanguage('ml-IN')}
            >ML</button>
          </div>
        </div>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              AI Recovery Coach
            </h1>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              aiResponseQuality === 'high' ? 'bg-green-500/20 text-green-200 border border-green-400/30' :
              aiResponseQuality === 'medium' ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-400/30' :
              'bg-blue-500/20 text-blue-200 border border-blue-400/30'
            }`}>
              {aiResponseQuality === 'high' ? '🔥 Premium AI' : 
               aiResponseQuality === 'medium' ? '⚡ Server AI' : 
               '🧠 Smart Fallback'}
            </div>
          </div>
          <p className="text-lg text-blue-700 font-medium">
            Your compassionate companion on the journey to recovery
          </p>
        </motion.div>

        {/* Main Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/15 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            
            {/* Avatar Section */}
            <div className="bg-gradient-to-r from-blue-500/80 via-purple-500/80 to-indigo-600/80 p-8 text-center">
              <AnimatedAvatar 
                speaking={isSpeaking || isStreaming}
                listening={isListening}
                locale={language}
              />
              
              <motion.h3 
                className="text-white text-xl font-semibold mt-6"
                animate={{ scale: (isListening || isSpeaking) ? [1, 1.02, 1] : 1 }}
                transition={{ duration: 0.5, repeat: (isListening || isSpeaking) ? Infinity : 0 }}
              >
                {isSpeaking 
                  ? (language.startsWith('ml') ? 'ഞാൻ സംസാരിക്കുന്നു...' : 'Speaking to you...') 
                  : isListening 
                  ? (language.startsWith('ml') ? 'ഞാൻ ശ്രദ്ധയോടെ കേൾക്കുന്നു...' : 'I\'m listening carefully...') 
                  : (language.startsWith('ml') ? 'എ.ഐ. റിക്കവറി കോച്ച്' : 'AI Recovery Coach')}
              </motion.h3>
              
              {/* Stop Speaking Button */}
              {isSpeaking && (
                <motion.button
                  onClick={stopSpeaking}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2"
                  whileTap={{ scale: 0.95 }}
                >
                  <Square className="w-4 h-4" />
                  Stop Speaking
                </motion.button>
              )}
              
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
            <div className="h-96 overflow-y-auto p-6 space-y-4 bg-white/5">
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
                  <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-white/20 text-white border border-white/30 rounded-bl-md shadow-xl backdrop-blur-xl">
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
                className={`mx-6 mb-4 p-4 rounded-xl border backdrop-blur-xl ${
                  error.includes('✅') ? 'bg-green-500/10 border-green-400/30 text-green-200' :
                  error.includes('🔊') || error.includes('🗣️') ? 'bg-blue-500/10 border-blue-400/30 text-blue-200' :
                  error.includes('🎤') ? 'bg-yellow-500/10 border-yellow-400/30 text-yellow-100' :
                  'bg-red-500/10 border-red-400/30 text-red-200'
                }`}
              >
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}

              {/* Enhanced Input Section */}
              <div className="p-6 bg-white/5 backdrop-blur-xl border-t border-white/10">
                {/* Conversation Controls */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => {
                        const transcript = messages.map(m => 
                          `${m.isUser ? 'You' : 'AI Coach'} (${new Date(m.timestamp).toLocaleTimeString()}): ${m.text}`
                        ).join('\n\n')
                        navigator.clipboard.writeText(transcript)
                        setError('✅ Conversation copied to clipboard!')
                        setTimeout(() => setError(''), 2000)
                      }}
                      className="px-3 py-2 text-xs bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all duration-200"
                    >
                      📋 Export Chat
                    </motion.button>
                    
                    <motion.button
                      onClick={() => {
                        setMessages([])
                        setError('🗑️ Conversation cleared!')
                        setTimeout(() => setError(''), 2000)
                      }}
                      className="px-3 py-2 text-xs bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-lg text-red-200 transition-all duration-200"
                    >
                      🗑️ Clear
                    </motion.button>
                  </div>
                  
                  <div className="text-xs text-gray-300">
                    {messages.length} messages • {new Date().toLocaleTimeString()}
                  </div>
                </div>
                
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
                    className="w-full px-4 py-3 rounded-xl border border-white/30 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 bg-white/15 backdrop-blur-xl transition-all duration-200 text-white placeholder-gray-200 shadow-lg"
                    disabled={isListening || isStreaming}
                  />
                </div>

                {/* Voice Control Button */}
                {/* Auto-listen Toggle */}
                <motion.button
                  onClick={() => setAutoListen((v) => !v)}
                  className={`p-3 rounded-xl transition-all duration-200 shadow-lg ${
                    autoListen 
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700' 
                      : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600'
                  }`}
                  whileTap={{ scale: 0.95 }}
                  title={autoListen ? 'Auto-listen enabled - Click to disable' : 'Auto-listen disabled - Click to enable'}
                >
                  {autoListen ? 'Auto' : 'Manual'}
                </motion.button>

                {/* Voice Control Button */}
                <motion.button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`p-3 rounded-xl transition-all duration-200 shadow-lg ${
                    voiceEnabled 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700' 
                      : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600'
                  }`}
                  whileTap={{ scale: 0.95 }}
                  title={voiceEnabled ? 'Voice enabled - Click to disable' : 'Voice disabled - Click to enable'}
                >
                  {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </motion.button>

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
                {/* DEBUG BUTTON for testing */}
                <motion.button
                  onClick={() => {
                    console.log('🧪 TESTING AI FUNCTION DIRECTLY')
                    queryAI('Testing AI function directly - please respond with a simple hello message')
                  }}
                  className="px-4 py-2 text-sm bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-full transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isListening || isStreaming}
                >
                  <span>🧪</span>
                  <span className="font-medium text-red-200">DEBUG AI</span>
                </motion.button>
                
                {[
                  { text: 'I need help now', prompt: 'I am struggling right now and need immediate support and encouragement', icon: '🆘' },
                  { text: 'Managing cravings', prompt: 'I am experiencing cravings and need help managing them effectively', icon: '🌊' },
                  { text: 'Feeling anxious', prompt: 'I am feeling anxious and need coping strategies to calm down', icon: '😰' },
                  { text: 'Relapse concerns', prompt: 'I am worried about relapsing or had a slip and need guidance', icon: '💔' },
                  { text: 'Motivation boost', prompt: 'I need motivation and encouragement to stay strong in my recovery', icon: '💪' },
                  { text: 'Loneliness support', prompt: 'I am feeling lonely and isolated in my recovery journey', icon: '🤗' },
                  { text: 'Gratitude sharing', prompt: 'I want to share something I am grateful for in my recovery', icon: '🙏' },
                  { text: 'Progress check', prompt: 'Help me reflect on my recovery progress and next steps', icon: '📈' },
                  { text: 'Anger management', prompt: 'I am feeling angry and need help managing these emotions', icon: '😡' },
                  { text: 'Family issues', prompt: 'I am dealing with family relationship challenges in recovery', icon: '👨‍👩‍👧‍👦' },
                  { text: 'Sleep problems', prompt: 'I am having trouble sleeping and it is affecting my recovery', icon: '😴' },
                  { text: 'Work stress', prompt: 'I am stressed about work and worried it might affect my recovery', icon: '💼' }
                ].map((quickAction, index) => (
                  <motion.button
                    key={index}
                    onClick={() => queryAI(quickAction.prompt)}
                    className="px-4 py-2 text-sm bg-white/20 hover:bg-white/30 border border-white/30 rounded-full transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isListening || isStreaming}
                  >
                    <span>{quickAction.icon}</span>
                    <span className="font-medium text-white">{quickAction.text}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </OppenheimerBackground>
  )
}

export default Assistant
