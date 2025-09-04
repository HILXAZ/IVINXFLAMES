import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, RotateCcw, Trophy, Zap, Target, Clock, Activity } from 'lucide-react'
import GlassmorphismCard from '../components/GlassmorphismCard'

const TypingTest = () => {
  // Word pool for the typing test
  const wordPool = [
    'ability', 'absence', 'academy', 'account', 'accused', 'achieve', 'acquire', 'address', 'advance', 'adverse',
    'advice', 'adviser', 'advocate', 'aircraft', 'alcohol', 'already', 'analysis', 'ancient', 'another', 'anxiety',
    'anybody', 'anymore', 'anywhere', 'apparent', 'approach', 'approval', 'arrange', 'article', 'assault', 'assist',
    'assume', 'attempt', 'attract', 'auction', 'average', 'balance', 'barrier', 'battery', 'because', 'bedroom',
    'benefit', 'bicycle', 'binding', 'brother', 'brought', 'builder', 'burning', 'business', 'cabinet', 'caliber',
    'capable', 'captain', 'capture', 'careful', 'carrier', 'casual', 'catalog', 'cause', 'ceiling', 'central',
    'century', 'certain', 'chamber', 'channel', 'chapter', 'charity', 'chemical', 'chicken', 'choice', 'citizen',
    'classic', 'climate', 'closest', 'closure', 'clothes', 'coffee', 'collect', 'college', 'combine', 'comfort',
    'command', 'comment', 'company', 'compare', 'compete', 'complex', 'concept', 'concern', 'conduct', 'confirm',
    'connect', 'consent', 'consist', 'contact', 'contain', 'content', 'contest', 'context', 'control', 'convert'
  ]

  // State management
  const [gameState, setGameState] = useState('ready') // ready, playing, finished
  const [currentWords, setCurrentWords] = useState([])
  const [userInput, setUserInput] = useState('')
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [correctChars, setCorrectChars] = useState(0)
  const [totalChars, setTotalChars] = useState(0)
  const [errors, setErrors] = useState(0)

  const inputRef = useRef(null)
  const timerRef = useRef(null)

  // Generate random words for the test
  const generateWords = () => {
    const words = []
    for (let i = 0; i < 50; i++) {
      words.push(wordPool[Math.floor(Math.random() * wordPool.length)])
    }
    setCurrentWords(words)
  }

  // Start the typing test
  const startTest = () => {
    generateWords()
    setGameState('playing')
    setUserInput('')
    setCurrentWordIndex(0)
    setTimeLeft(60)
    setStartTime(Date.now())
    setCorrectChars(0)
    setTotalChars(0)
    setErrors(0)
    setAccuracy(100)
    setWpm(0)
    
    // Focus input
    setTimeout(() => inputRef.current?.focus(), 100)
    
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          finishTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Finish the typing test
  const finishTest = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    setEndTime(Date.now())
    setGameState('finished')
    
    // Calculate final stats
    const timeElapsed = (60 - timeLeft) / 60 // in minutes
    const wordsTyped = correctChars / 5 // standard: 5 chars = 1 word
    const finalWpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0
    const finalAccuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100
    
    setWpm(finalWpm)
    setAccuracy(finalAccuracy)
  }

  // Handle user input
  const handleInputChange = (e) => {
    if (gameState !== 'playing') return
    
    const value = e.target.value
    const currentWord = currentWords[currentWordIndex] || ''
    
    setUserInput(value)
    
    // Calculate stats
    const chars = value.length
    setTotalChars(prev => Math.max(prev, currentWordIndex * 6 + chars)) // rough estimate
    
    // Check if word is complete
    if (value.endsWith(' ') || value === currentWord) {
      const typedWord = value.trim()
      
      if (typedWord === currentWord) {
        setCorrectChars(prev => prev + currentWord.length + 1) // +1 for space
        setCurrentWordIndex(prev => prev + 1)
        setUserInput('')
      } else {
        setErrors(prev => prev + 1)
        if (value.endsWith(' ')) {
          setCurrentWordIndex(prev => prev + 1)
          setUserInput('')
        }
      }
    }
    
    // Calculate real-time WPM
    const timeElapsed = (Date.now() - startTime) / 60000 // in minutes
    if (timeElapsed > 0) {
      const wordsTyped = correctChars / 5
      const currentWpm = Math.round(wordsTyped / timeElapsed)
      setWpm(currentWpm)
    }
    
    // Calculate accuracy
    if (totalChars > 0) {
      const currentAccuracy = Math.round((correctChars / Math.max(totalChars, 1)) * 100)
      setAccuracy(currentAccuracy)
    }
  }

  // Reset test
  const resetTest = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    setGameState('ready')
    setUserInput('')
    setCurrentWordIndex(0)
    setTimeLeft(60)
    setStartTime(null)
    setEndTime(null)
    setWpm(0)
    setAccuracy(100)
    setCorrectChars(0)
    setTotalChars(0)
    setErrors(0)
    setCurrentWords([])
  }

  // Get current word with highlighting
  const getCurrentWordDisplay = () => {
    const currentWord = currentWords[currentWordIndex] || ''
    const input = userInput.replace(' ', '')
    
    return currentWord.split('').map((char, index) => {
      let className = 'text-gray-600'
      
      if (index < input.length) {
        className = input[index] === char ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
      } else if (index === input.length) {
        className = 'text-gray-900 bg-blue-200 animate-pulse' // cursor
      }
      
      return (
        <span key={index} className={`px-0.5 rounded ${className}`}>
          {char}
        </span>
      )
    })
  }

  // Performance level based on WPM
  const getPerformanceLevel = (wpm) => {
    if (wpm >= 70) return { level: 'Expert', color: 'text-purple-600', icon: Trophy }
    if (wpm >= 50) return { level: 'Advanced', color: 'text-blue-600', icon: Zap }
    if (wpm >= 30) return { level: 'Intermediate', color: 'text-green-600', icon: Target }
    return { level: 'Beginner', color: 'text-yellow-600', icon: Activity }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const performance = getPerformanceLevel(wpm)
  const PerformanceIcon = performance.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-2 sm:p-4 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Header - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            ⌨️ Typing Speed Test
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
            Test your typing speed and accuracy in 60 seconds!
          </p>
        </motion.div>

        {/* Stats Bar - Responsive Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4"
        >
          <GlassmorphismCard variant="floating" intensity="medium" className="p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Time</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{timeLeft}s</div>
          </GlassmorphismCard>
          
          <GlassmorphismCard variant="floating" intensity="medium" className="p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">WPM</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-green-600">{wpm}</div>
          </GlassmorphismCard>
          
          <GlassmorphismCard variant="floating" intensity="medium" className="p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 mr-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Accuracy</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-purple-600">{accuracy}%</div>
          </GlassmorphismCard>
          
          <GlassmorphismCard variant="floating" intensity="medium" className="p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <PerformanceIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${performance.color} mr-2`} />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Level</span>
            </div>
            <div className={`text-sm sm:text-lg font-bold ${performance.color}`}>{performance.level}</div>
          </GlassmorphismCard>
        </motion.div>

        {/* Main Test Area */}
        <GlassmorphismCard variant="hero" intensity="strong" className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {gameState === 'ready' && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center space-y-6"
              >
                <div className="space-y-4">
                  <div className="text-4xl sm:text-5xl lg:text-6xl">⌨️</div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Ready to Type?</h2>
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-md mx-auto">
                    Type the words as they appear. You have 60 seconds to type as many words as possible.
                  </p>
                </div>
                
                <motion.button
                  onClick={startTest}
                  className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Typing Test
                </motion.button>
              </motion.div>
            )}

            {gameState === 'playing' && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Words Display */}
                <div className="bg-white/30 rounded-xl p-4 sm:p-6 border border-white/40 min-h-[80px] sm:min-h-[100px] lg:min-h-[120px]">
                  <div className="text-base sm:text-lg lg:text-xl leading-relaxed font-mono">
                    {currentWords.slice(currentWordIndex, currentWordIndex + 15).map((word, index) => (
                      <span key={currentWordIndex + index} className="mr-3">
                        {index === 0 ? (
                          <span className="bg-blue-100 px-2 py-1 rounded">
                            {getCurrentWordDisplay()}
                          </span>
                        ) : (
                          <span className="text-gray-600">{word}</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Input Area */}
                <div className="space-y-4">
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    placeholder="Start typing here..."
                    className="w-full px-4 py-3 sm:px-6 sm:py-4 text-lg sm:text-xl border border-white/30 rounded-xl bg-white/20 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoComplete="off"
                    spellCheck="false"
                  />
                  
                  <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600">
                    <span>Word {currentWordIndex + 1} of {currentWords.length}</span>
                    <span>Errors: {errors}</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <motion.button
                    onClick={resetTest}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset</span>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {gameState === 'finished' && (
              <motion.div
                key="finished"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center space-y-6"
              >
                <div className="space-y-4">
                  <div className="text-4xl sm:text-5xl lg:text-6xl">🎉</div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Test Complete!</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-xs sm:max-w-lg mx-auto">
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-3 sm:p-4">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">{wpm}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Words per minute</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-3 sm:p-4">
                      <div className="text-xl sm:text-2xl font-bold text-green-600">{accuracy}%</div>
                      <div className="text-xs sm:text-sm text-gray-600">Accuracy</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-3 sm:p-4">
                      <div className={`text-sm sm:text-lg font-bold ${performance.color}`}>{performance.level}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Performance</div>
                    </div>
                  </div>
                  
                  <div className="text-gray-600 text-sm sm:text-base">
                    <p>You typed {Math.round(correctChars / 5)} words with {errors} errors.</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <motion.button
                    onClick={startTest}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Try Again
                  </motion.button>
                  
                  <motion.button
                    onClick={resetTest}
                    className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassmorphismCard>

        {/* Tips */}
        <GlassmorphismCard variant="panel" intensity="medium" className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 Typing Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>• Keep your fingers on the home row</div>
            <div>• Look at the screen, not your keyboard</div>
            <div>• Maintain steady rhythm</div>
            <div>• Practice regularly for improvement</div>
          </div>
        </GlassmorphismCard>

      </div>
    </div>
  )
}

export default TypingTest
