import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Target, Timer, TrendingUp, Zap, CheckCircle, X, RotateCcw, Award } from 'lucide-react'

// Cognitive Balance Exercises - Executive Function Training
const CognitiveBalanceExercises = ({ onComplete }) => {
  const [currentExercise, setCurrentExercise] = useState(null)
  const [exerciseData, setExerciseData] = useState({
    stroopTest: { scores: [], averageTime: 0, accuracy: 0 },
    memorySpan: { scores: [], maxSpan: 0, accuracy: 0 },
    attentionControl: { scores: [], averageTime: 0, accuracy: 0 },
    inhibitionTest: { scores: [], averageTime: 0, accuracy: 0 }
  })
  
  // Exercise state
  const [gameState, setGameState] = useState('menu')
  const [currentRound, setCurrentRound] = useState(0)
  const [score, setScore] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [startTime, setStartTime] = useState(0)
  const [timeLimit, setTimeLimit] = useState(60)
  const [responses, setResponses] = useState([])

  // Stroop Test State
  const [stroopWord, setStroopWord] = useState('')
  const [stroopColor, setStroopColor] = useState('')
  const [stroopOptions, setStroopOptions] = useState([])

  // Memory Span State
  const [memorySequence, setMemorySequence] = useState([])
  const [userSequence, setUserSequence] = useState([])
  const [showingSequence, setShowingSequence] = useState(false)
  const [currentSpan, setCurrentSpan] = useState(3)

  // Attention Control State
  const [targetStimulus, setTargetStimulus] = useState('')
  const [currentStimulus, setCurrentStimulus] = useState('')
  const [distractors, setDistractors] = useState([])

  const exercises = {
    stroop: {
      name: "Stroop Color Test",
      description: "Identify the color of words while ignoring their meaning",
      icon: Brain,
      color: "blue",
      difficulty: "Medium",
      benefits: "Improves impulse control and attention"
    },
    memory: {
      name: "Memory Span Test",
      description: "Remember and repeat sequences of increasing length",
      icon: Target,
      color: "green", 
      difficulty: "Progressive",
      benefits: "Enhances working memory and focus"
    },
    attention: {
      name: "Attention Control",
      description: "Focus on targets while ignoring distractions",
      icon: Zap,
      color: "purple",
      difficulty: "Hard",
      benefits: "Strengthens selective attention"
    },
    inhibition: {
      name: "Response Inhibition",
      description: "Control impulsive responses to stimuli",
      icon: Timer,
      color: "red",
      difficulty: "Medium",
      benefits: "Builds self-control and restraint"
    }
  }

  // Stroop Test Logic
  const generateStroopStimulus = () => {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple']
    const colorWords = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE']
    
    const word = colorWords[Math.floor(Math.random() * colorWords.length)]
    const color = colors[Math.floor(Math.random() * colors.length)]
    
    setStroopWord(word)
    setStroopColor(color)
    setStroopOptions(colors.sort(() => Math.random() - 0.5))
    setStartTime(Date.now())
  }

  const handleStroopResponse = (selectedColor) => {
    const responseTime = Date.now() - startTime
    const isCorrect = selectedColor === stroopColor
    
    setResponses(prev => [...prev, {
      correct: isCorrect,
      responseTime,
      round: currentRound
    }])
    
    if (isCorrect) {
      setScore(prev => prev + 10)
    } else {
      setAccuracy(prev => Math.max(0, prev - 5))
    }
    
    setCurrentRound(prev => prev + 1)
    
    if (currentRound >= 19) { // 20 rounds total
      completeExercise('stroop')
    } else {
      setTimeout(generateStroopStimulus, 500)
    }
  }

  // Memory Span Logic
  const generateMemorySequence = () => {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']
    const sequence = []
    for (let i = 0; i < currentSpan; i++) {
      sequence.push(colors[Math.floor(Math.random() * colors.length)])
    }
    setMemorySequence(sequence)
    setUserSequence([])
    showSequenceToUser(sequence)
  }

  const showSequenceToUser = (sequence) => {
    setShowingSequence(true)
    let index = 0
    
    const showNext = () => {
      if (index < sequence.length) {
        setCurrentStimulus(sequence[index])
        index++
        setTimeout(() => {
          setCurrentStimulus('')
          setTimeout(showNext, 500)
        }, 1000)
      } else {
        setShowingSequence(false)
        setCurrentStimulus('')
      }
    }
    
    setTimeout(showNext, 1000)
  }

  const handleMemoryResponse = (color) => {
    const newUserSequence = [...userSequence, color]
    setUserSequence(newUserSequence)
    
    if (newUserSequence.length === memorySequence.length) {
      const isCorrect = newUserSequence.every((color, index) => color === memorySequence[index])
      
      setResponses(prev => [...prev, {
        correct: isCorrect,
        span: currentSpan,
        round: currentRound
      }])
      
      if (isCorrect) {
        setScore(prev => prev + currentSpan * 5)
        setCurrentSpan(prev => prev + 1)
      } else {
        setAccuracy(prev => Math.max(0, prev - 10))
        if (currentSpan > 3) setCurrentSpan(prev => prev - 1)
      }
      
      setCurrentRound(prev => prev + 1)
      
      if (currentRound >= 9) { // 10 rounds total
        completeExercise('memory')
      } else {
        setTimeout(generateMemorySequence, 1000)
      }
    }
  }

  // Attention Control Logic
  const generateAttentionTask = () => {
    const shapes = ['●', '■', '▲', '◆', '★']
    const target = shapes[Math.floor(Math.random() * shapes.length)]
    const distractorCount = 8 + Math.floor(Math.random() * 4)
    const distractorShapes = []
    
    for (let i = 0; i < distractorCount; i++) {
      const distractor = shapes.filter(s => s !== target)[Math.floor(Math.random() * 4)]
      distractorShapes.push(distractor)
    }
    
    // Add target at random position
    const targetPosition = Math.floor(Math.random() * (distractorCount + 1))
    distractorShapes.splice(targetPosition, 0, target)
    
    setTargetStimulus(target)
    setDistractors(distractorShapes)
    setStartTime(Date.now())
  }

  const handleAttentionResponse = (clickedIndex) => {
    const responseTime = Date.now() - startTime
    const isCorrect = distractors[clickedIndex] === targetStimulus
    
    setResponses(prev => [...prev, {
      correct: isCorrect,
      responseTime,
      round: currentRound
    }])
    
    if (isCorrect) {
      setScore(prev => prev + 15)
    } else {
      setAccuracy(prev => Math.max(0, prev - 8))
    }
    
    setCurrentRound(prev => prev + 1)
    
    if (currentRound >= 14) { // 15 rounds total
      completeExercise('attention')
    } else {
      setTimeout(generateAttentionTask, 800)
    }
  }

  // Response Inhibition Logic (Go/No-Go Task)
  const generateInhibitionTask = () => {
    const stimuli = ['GO', 'STOP']
    const isGo = Math.random() > 0.3 // 70% Go trials, 30% No-Go
    setCurrentStimulus(isGo ? 'GO' : 'STOP')
    setStartTime(Date.now())
    
    // Auto-advance after timeout
    setTimeout(() => {
      if (gameState === 'playing') {
        handleInhibitionTimeout(isGo)
      }
    }, 1500)
  }

  const handleInhibitionResponse = () => {
    const responseTime = Date.now() - startTime
    const isGo = currentStimulus === 'GO'
    
    setResponses(prev => [...prev, {
      correct: isGo, // Correct if responded to GO
      responseTime,
      round: currentRound,
      responded: true
    }])
    
    if (isGo) {
      setScore(prev => prev + 10)
    } else {
      setAccuracy(prev => Math.max(0, prev - 10)) // Penalty for responding to STOP
    }
    
    setCurrentRound(prev => prev + 1)
    
    if (currentRound >= 19) { // 20 rounds total
      completeExercise('inhibition')
    } else {
      setTimeout(generateInhibitionTask, 700)
    }
  }

  const handleInhibitionTimeout = (wasGo) => {
    setResponses(prev => [...prev, {
      correct: !wasGo, // Correct if didn't respond to STOP
      responseTime: 1500,
      round: currentRound,
      responded: false
    }])
    
    if (!wasGo) {
      setScore(prev => prev + 10) // Reward for correctly inhibiting
    } else {
      setAccuracy(prev => Math.max(0, prev - 5)) // Small penalty for missing GO
    }
    
    setCurrentRound(prev => prev + 1)
    
    if (currentRound >= 19) {
      completeExercise('inhibition')
    } else {
      setTimeout(generateInhibitionTask, 700)
    }
  }

  const startExercise = (exerciseType) => {
    setCurrentExercise(exerciseType)
    setGameState('playing')
    setCurrentRound(0)
    setScore(0)
    setAccuracy(100)
    setResponses([])
    
    switch(exerciseType) {
      case 'stroop':
        generateStroopStimulus()
        break
      case 'memory':
        setCurrentSpan(3)
        generateMemorySequence()
        break
      case 'attention':
        generateAttentionTask()
        break
      case 'inhibition':
        generateInhibitionTask()
        break
    }
  }

  const completeExercise = (exerciseType) => {
    setGameState('completed')
    
    // Calculate final metrics
    const correctResponses = responses.filter(r => r.correct).length
    const finalAccuracy = (correctResponses / responses.length) * 100
    const avgResponseTime = responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length
    
    // Update exercise data
    setExerciseData(prev => ({
      ...prev,
      [exerciseType]: {
        scores: [...prev[exerciseType].scores, score],
        averageTime: avgResponseTime,
        accuracy: finalAccuracy
      }
    }))
    
    // Call completion callback
    if (onComplete) {
      onComplete({
        exerciseType,
        score,
        accuracy: finalAccuracy,
        averageTime: avgResponseTime,
        improvement: calculateImprovement(exerciseType, score)
      })
    }
  }

  const calculateImprovement = (exerciseType, newScore) => {
    const previousScores = exerciseData[exerciseType].scores
    if (previousScores.length === 0) return 0
    
    const avgPrevious = previousScores.reduce((sum, score) => sum + score, 0) / previousScores.length
    return ((newScore - avgPrevious) / avgPrevious) * 100
  }

  const resetExercise = () => {
    setGameState('menu')
    setCurrentExercise(null)
  }

  // Exercise Menu
  if (gameState === 'menu') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cognitive Balance Exercises</h2>
          <p className="text-gray-600">Train your executive function to improve impulse control</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(exercises).map(([key, exercise]) => {
            const IconComponent = exercise.icon
            const recentScores = exerciseData[key].scores.slice(-5)
            const avgScore = recentScores.length > 0 ? 
              Math.round(recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length) : 0
            
            return (
              <motion.div
                key={key}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-lg bg-${exercise.color}-100`}>
                    <IconComponent className={`text-${exercise.color}-600`} size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{exercise.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{exercise.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded bg-${exercise.color}-50 text-${exercise.color}-700`}>
                        {exercise.difficulty}
                      </span>
                      {avgScore > 0 && (
                        <span>Best: {avgScore} pts</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{exercise.benefits}</p>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startExercise(key)}
                  className={`w-full py-3 bg-gradient-to-r from-${exercise.color}-500 to-${exercise.color}-600 text-white rounded-lg font-medium`}
                >
                  Start Exercise
                </motion.button>
              </motion.div>
            )
          })}
        </div>
        
        {/* Progress Summary */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-500" size={20} />
            Your Cognitive Progress
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(exercises).map(([key, exercise]) => {
              const scores = exerciseData[key].scores
              const improvement = scores.length >= 2 ? 
                ((scores[scores.length - 1] - scores[0]) / scores[0]) * 100 : 0
              
              return (
                <div key={key} className="text-center">
                  <div className={`text-2xl font-bold text-${exercise.color}-600`}>
                    {scores.length}
                  </div>
                  <div className="text-sm text-gray-600">Sessions</div>
                  {improvement !== 0 && (
                    <div className={`text-xs ${improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {improvement > 0 ? '+' : ''}{Math.round(improvement)}%
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Exercise Completion Screen
  if (gameState === 'completed') {
    const exercise = exercises[currentExercise]
    const correctResponses = responses.filter(r => r.correct).length
    const finalAccuracy = (correctResponses / responses.length) * 100
    const avgResponseTime = responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-8 shadow-lg text-center max-w-md mx-auto"
      >
        <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-${exercise.color}-100 flex items-center justify-center`}>
          <Award className={`text-${exercise.color}-600`} size={32} />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Exercise Complete!</h2>
        <p className="text-gray-600 mb-6">{exercise.name}</p>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{score}</div>
            <div className="text-sm text-gray-600">Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{Math.round(finalAccuracy)}%</div>
            <div className="text-sm text-gray-600">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{Math.round(avgResponseTime)}ms</div>
            <div className="text-sm text-gray-600">Avg Time</div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={resetExercise}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Back to Menu
          </button>
          <button
            onClick={() => startExercise(currentExercise)}
            className={`flex-1 py-3 bg-${exercise.color}-600 text-white rounded-lg hover:bg-${exercise.color}-700 flex items-center justify-center gap-2`}
          >
            <RotateCcw size={16} />
            Try Again
          </button>
        </div>
      </motion.div>
    )
  }

  // Active Exercise Rendering
  const exercise = exercises[currentExercise]
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 max-w-2xl mx-4 text-center relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{exercise.name}</h2>
          <button
            onClick={resetExercise}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Progress & Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6 text-center">
          <div>
            <div className="text-xl font-bold text-blue-600">{currentRound}</div>
            <div className="text-xs text-gray-600">Round</div>
          </div>
          <div>
            <div className="text-xl font-bold text-green-600">{score}</div>
            <div className="text-xs text-gray-600">Score</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-600">{Math.round(accuracy)}%</div>
            <div className="text-xs text-gray-600">Accuracy</div>
          </div>
          <div>
            <div className="text-xl font-bold text-red-600">
              {responses.filter(r => r.correct).length}/{responses.length}
            </div>
            <div className="text-xs text-gray-600">Correct</div>
          </div>
        </div>
        
        {/* Exercise Content */}
        <div className="min-h-[200px] flex items-center justify-center">
          {currentExercise === 'stroop' && (
            <div className="text-center">
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-2">What COLOR is this word?</div>
                <div 
                  className="text-6xl font-bold mb-6"
                  style={{ color: stroopColor }}
                >
                  {stroopWord}
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-3">
                {stroopOptions.map((color) => (
                  <motion.button
                    key={color}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStroopResponse(color)}
                    className="w-16 h-16 rounded-full border-4 border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {currentExercise === 'memory' && (
            <div className="text-center">
              {showingSequence ? (
                <div>
                  <div className="text-sm text-gray-600 mb-4">Remember this sequence:</div>
                  <div 
                    className="w-32 h-32 rounded-full mx-auto mb-4 border-4"
                    style={{ backgroundColor: currentStimulus }}
                  />
                  <div className="text-lg font-medium">Span: {currentSpan}</div>
                </div>
              ) : (
                <div>
                  <div className="text-sm text-gray-600 mb-4">
                    Click the colors in order ({userSequence.length + 1}/{memorySequence.length}):
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {['red', 'blue', 'green', 'yellow', 'purple', 'orange'].map((color) => (
                      <motion.button
                        key={color}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMemoryResponse(color)}
                        className="w-16 h-16 rounded-full border-4 border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {currentExercise === 'attention' && (
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-4">
                Find and click the: <span className="text-2xl font-bold">{targetStimulus}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                {distractors.map((shape, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleAttentionResponse(index)}
                    className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl hover:bg-gray-200"
                  >
                    {shape}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
          
          {currentExercise === 'inhibition' && (
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-6">
                Click ONLY when you see "GO". Don't click for "STOP"!
              </div>
              <motion.button
                onClick={handleInhibitionResponse}
                className={`w-48 h-48 rounded-2xl text-4xl font-bold ${
                  currentStimulus === 'GO' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}
                animate={{ 
                  scale: currentStimulus === 'GO' ? [1, 1.1, 1] : [1, 0.9, 1]
                }}
                transition={{ duration: 0.3 }}
              >
                {currentStimulus}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default CognitiveBalanceExercises
