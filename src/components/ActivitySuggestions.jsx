import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  RefreshCw, 
  Lightbulb, 
  Activity, 
  Brain,
  Heart,
  Music,
  BookOpen,
  Coffee,
  Smartphone,
  Users,
  Home,
  MapPin,
  Star,
  Clock
} from 'lucide-react'

const ActivitySuggestions = () => {
  const [suggestions, setSuggestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [weather, setWeather] = useState(null)
  const [timeOfDay, setTimeOfDay] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadSuggestions()
    updateTimeOfDay()
    
    // Update time of day every minute
    const timer = setInterval(updateTimeOfDay, 60000)
    return () => clearInterval(timer)
  }, [])

  const updateTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 6) setTimeOfDay('early morning')
    else if (hour < 12) setTimeOfDay('morning')
    else if (hour < 17) setTimeOfDay('afternoon')
    else if (hour < 21) setTimeOfDay('evening')
    else setTimeOfDay('night')
  }

  const loadSuggestions = async () => {
    try {
      // Get current weather
      const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY
      
      if (apiKey && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
            )
            const weatherData = await response.json()
            setWeather(weatherData)
            generateSuggestions(weatherData)
          },
          () => {
            generateSuggestions(null)
          }
        )
      } else {
        generateSuggestions(null)
      }
    } catch (error) {
      console.error('Error loading suggestions:', error)
      generateSuggestions(null)
    }
  }

  const generateSuggestions = (weatherData) => {
    const hour = new Date().getHours()
    const isWeekend = [0, 6].includes(new Date().getDay())
    
    let suggestions = []

    // Weather-based suggestions
    if (weatherData) {
      const temp = weatherData.main.temp
      const condition = weatherData.weather[0].main.toLowerCase()
      
      if (condition.includes('rain')) {
        suggestions.push(
          { type: 'indoor', icon: BookOpen, title: 'Read a Book', description: 'Perfect weather for cozy reading', mood: 'calm' },
          { type: 'indoor', icon: Music, title: 'Listen to Podcasts', description: 'Rainy day mindfulness', mood: 'peaceful' },
          { type: 'indoor', icon: Coffee, title: 'Practice Meditation', description: 'Let the rain sounds guide you', mood: 'centered' }
        )
      } else if (condition.includes('clear') && temp > 15) {
        suggestions.push(
          { type: 'outdoor', icon: Activity, title: 'Take a Walk', description: 'Beautiful weather for outdoor activity', mood: 'energized' },
          { type: 'outdoor', icon: Heart, title: 'Outdoor Breathing', description: 'Fresh air and mindfulness', mood: 'refreshed' },
          { type: 'outdoor', icon: MapPin, title: 'Explore Nature', description: 'Perfect day for exploration', mood: 'adventurous' }
        )
      } else if (temp < 5) {
        suggestions.push(
          { type: 'indoor', icon: Coffee, title: 'Warm Beverage & Journal', description: 'Cozy cold weather activity', mood: 'contemplative' },
          { type: 'indoor', icon: Brain, title: 'Indoor Workout', description: 'Stay warm and active', mood: 'motivated' }
        )
      }
    }

    // Time-based suggestions
    if (hour < 10) {
      suggestions.push(
        { type: 'morning', icon: Activity, title: 'Morning Stretches', description: 'Start your day with movement', mood: 'energetic' },
        { type: 'morning', icon: Brain, title: 'Set Daily Intentions', description: 'Plan your recovery goals', mood: 'focused' },
        { type: 'morning', icon: Coffee, title: 'Mindful Breakfast', description: 'Eat consciously and slowly', mood: 'mindful' }
      )
    } else if (hour >= 12 && hour < 17) {
      suggestions.push(
        { type: 'afternoon', icon: Users, title: 'Connect with Support', description: 'Reach out to your network', mood: 'connected' },
        { type: 'afternoon', icon: Lightbulb, title: 'Learn Something New', description: 'Productive afternoon activity', mood: 'curious' },
        { type: 'afternoon', icon: Activity, title: 'Power Walk', description: 'Boost your afternoon energy', mood: 'active' }
      )
    } else if (hour >= 17) {
      suggestions.push(
        { type: 'evening', icon: BookOpen, title: 'Reflection Time', description: 'Review your day\'s progress', mood: 'reflective' },
        { type: 'evening', icon: Heart, title: 'Gratitude Practice', description: 'End the day positively', mood: 'grateful' },
        { type: 'evening', icon: Music, title: 'Relaxing Music', description: 'Wind down peacefully', mood: 'peaceful' }
      )
    }

    // Recovery-specific suggestions
    suggestions.push(
      { type: 'recovery', icon: Brain, title: 'Craving Surfing', description: 'Practice mindful awareness', mood: 'resilient' },
      { type: 'recovery', icon: Smartphone, title: 'Call a Friend', description: 'Social connection helps', mood: 'supported' },
      { type: 'recovery', icon: Home, title: 'Organize Your Space', description: 'Productive distraction', mood: 'accomplished' },
      { type: 'recovery', icon: Star, title: 'Visualize Success', description: 'Imagine your goals achieved', mood: 'hopeful' }
    )

    // Weekend vs weekday
    if (isWeekend) {
      suggestions.push(
        { type: 'weekend', icon: Users, title: 'Family Time', description: 'Quality time with loved ones', mood: 'connected' },
        { type: 'weekend', icon: MapPin, title: 'Visit New Place', description: 'Explore your city differently', mood: 'adventurous' }
      )
    } else {
      suggestions.push(
        { type: 'weekday', icon: Clock, title: 'Quick Meditation', description: 'Fit mindfulness into busy day', mood: 'centered' },
        { type: 'weekday', icon: Brain, title: 'Skill Practice', description: 'Work on personal development', mood: 'growing' }
      )
    }

    // Shuffle and limit suggestions
    const shuffled = suggestions.sort(() => 0.5 - Math.random()).slice(0, 8)
    setSuggestions(shuffled)
  }

  const refreshSuggestions = async () => {
    setRefreshing(true)
    await loadSuggestions()
    setCurrentIndex(0)
    setTimeout(() => setRefreshing(false), 1000)
  }

  const nextSuggestion = () => {
    setCurrentIndex((prev) => (prev + 1) % suggestions.length)
  }

  const prevSuggestion = () => {
    setCurrentIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
  }

  const getTypeColor = (type) => {
    const colors = {
      outdoor: 'green',
      indoor: 'blue',
      morning: 'yellow',
      afternoon: 'orange',
      evening: 'purple',
      recovery: 'red',
      weekend: 'pink',
      weekday: 'indigo'
    }
    return colors[type] || 'gray'
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/20 rounded w-1/2"></div>
          <div className="h-20 bg-white/20 rounded"></div>
        </div>
      </div>
    )
  }

  const currentSuggestion = suggestions[currentIndex]
  const SuggestionIcon = currentSuggestion?.icon || Lightbulb
  const typeColor = getTypeColor(currentSuggestion?.type)

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold">Activity Suggestions</h3>
        </div>
        
        <motion.button
          onClick={refreshSuggestions}
          className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={refreshing ? { rotate: 360 } : {}}
          transition={{ duration: 0.8 }}
        >
          <RefreshCw className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Current suggestion */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="text-center">
            <motion.div
              className={`inline-flex p-4 bg-${typeColor}-500/20 border border-${typeColor}-400/30 rounded-2xl mb-4`}
              whileHover={{ scale: 1.05 }}
            >
              <SuggestionIcon className={`w-8 h-8 text-${typeColor}-400`} />
            </motion.div>
            
            <h4 className="text-xl font-bold mb-2">{currentSuggestion?.title}</h4>
            <p className="text-white/70 mb-4">{currentSuggestion?.description}</p>
            
            <div className="flex items-center justify-center space-x-4">
              <span className={`px-3 py-1 bg-${typeColor}-500/20 border border-${typeColor}-400/30 rounded-full text-sm capitalize`}>
                {currentSuggestion?.type?.replace('_', ' ')}
              </span>
              <span className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-sm">
                {currentSuggestion?.mood}
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <motion.button
          onClick={prevSuggestion}
          className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="w-4 h-4 rotate-180" />
        </motion.button>

        <div className="flex space-x-2">
          {suggestions.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white scale-125' : 'bg-white/30'
              }`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>

        <motion.button
          onClick={nextSuggestion}
          className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Context info */}
      <div className="bg-white/5 rounded-lg p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/70">
            Perfect for {timeOfDay}
            {weather && (
              <span> • {Math.round(weather.main.temp)}°C</span>
            )}
          </span>
          <span className="text-white/50">
            {currentIndex + 1} of {suggestions.length}
          </span>
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <motion.button
          className="p-3 bg-green-500/20 border border-green-400/30 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Start Activity
        </motion.button>
        
        <motion.button
          className="p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Save for Later
        </motion.button>
      </div>
    </div>
  )
}

export default ActivitySuggestions
