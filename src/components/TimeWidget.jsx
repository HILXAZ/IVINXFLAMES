import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, 
  Calendar, 
  Globe, 
  Sunrise, 
  Sunset,
  Moon,
  Sun
} from 'lucide-react'

const TimeWidget = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [timezone, setTimezone] = useState('')
  const [sunInfo, setSunInfo] = useState(null)

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Get timezone and sun info
    getLocationInfo()

    return () => clearInterval(timer)
  }, [])

  const getLocationInfo = async () => {
    try {
      // Get timezone
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      setTimezone(detectedTimezone)

      // Get sunrise/sunset info
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          try {
            const response = await fetch(
              `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&date=today&formatted=0`
            )
            const data = await response.json()
            
            if (data.status === 'OK') {
              setSunInfo({
                sunrise: new Date(data.results.sunrise),
                sunset: new Date(data.results.sunset),
                dayLength: data.results.day_length
              })
            }
          } catch (error) {
            console.log('Sunrise/sunset API error:', error)
          }
        },
        (error) => {
          console.log('Geolocation error:', error)
        }
      )
    } catch (error) {
      console.error('Location info error:', error)
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTimeOfDay = () => {
    const hour = currentTime.getHours()
    if (hour < 5) return { text: 'Late Night', icon: Moon, color: 'indigo' }
    if (hour < 12) return { text: 'Morning', icon: Sunrise, color: 'yellow' }
    if (hour < 17) return { text: 'Afternoon', icon: Sun, color: 'orange' }
    if (hour < 21) return { text: 'Evening', icon: Sunset, color: 'purple' }
    return { text: 'Night', icon: Moon, color: 'indigo' }
  }

  const getProgressOfDay = () => {
    const startOfDay = new Date(currentTime)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(currentTime)
    endOfDay.setHours(23, 59, 59, 999)
    
    const elapsed = currentTime - startOfDay
    const total = endOfDay - startOfDay
    
    return (elapsed / total) * 100
  }

  const timeOfDay = getTimeOfDay()
  const TimeIcon = timeOfDay.icon
  const dayProgress = getProgressOfDay()

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 text-white">
      {/* Main time display */}
      <div className="text-center mb-6">
        <motion.div
          className="text-4xl font-bold mb-2"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        >
          {formatTime(currentTime)}
        </motion.div>
        
        <div className="text-white/70 text-lg mb-4">
          {formatDate(currentTime)}
        </div>

        {/* Time of day indicator */}
        <motion.div
          className={`inline-flex items-center space-x-2 bg-${timeOfDay.color}-500/20 border border-${timeOfDay.color}-400/30 rounded-lg px-4 py-2`}
          whileHover={{ scale: 1.05 }}
        >
          <TimeIcon className={`w-5 h-5 text-${timeOfDay.color}-400`} />
          <span className="font-medium">{timeOfDay.text}</span>
        </motion.div>
      </div>

      {/* Day progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/70">Day Progress</span>
          <span className="text-sm font-medium">{Math.round(dayProgress)}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full"
            style={{ width: `${dayProgress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${dayProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Additional info grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Timezone */}
        <div className="bg-white/5 rounded-lg p-3 flex items-center space-x-2">
          <Globe className="w-4 h-4 text-blue-400" />
          <div>
            <div className="text-xs text-white/70">Timezone</div>
            <div className="text-sm font-medium">
              {timezone.split('/').pop()?.replace(/_/g, ' ') || 'Local'}
            </div>
          </div>
        </div>

        {/* Week progress */}
        <div className="bg-white/5 rounded-lg p-3 flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-green-400" />
          <div>
            <div className="text-xs text-white/70">Week Day</div>
            <div className="text-sm font-medium">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short' })} ({currentTime.getDate()})
            </div>
          </div>
        </div>

        {/* Sunrise time */}
        {sunInfo && (
          <div className="bg-white/5 rounded-lg p-3 flex items-center space-x-2">
            <Sunrise className="w-4 h-4 text-yellow-400" />
            <div>
              <div className="text-xs text-white/70">Sunrise</div>
              <div className="text-sm font-medium">
                {sunInfo.sunrise.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        )}

        {/* Sunset time */}
        {sunInfo && (
          <div className="bg-white/5 rounded-lg p-3 flex items-center space-x-2">
            <Sunset className="w-4 h-4 text-orange-400" />
            <div>
              <div className="text-xs text-white/70">Sunset</div>
              <div className="text-sm font-medium">
                {sunInfo.sunset.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Motivational time-based message */}
      <motion.div
        className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-400/30"
        whileHover={{ scale: 1.02 }}
      >
        <div className="text-center">
          <Clock className="w-5 h-5 text-purple-400 mx-auto mb-2" />
          <p className="text-sm text-white/90">
            {getMotivationalMessage(timeOfDay.text)}
          </p>
        </div>
      </motion.div>
    </div>
  )
}

const getMotivationalMessage = (timeOfDay) => {
  const messages = {
    'Morning': 'Great morning to start fresh! Every new day is a chance to build better habits.',
    'Afternoon': 'Keep going strong! The afternoon is perfect for staying focused on your goals.',
    'Evening': 'Wind down mindfully. Reflect on today\'s progress and prepare for tomorrow.',
    'Night': 'Rest well tonight. Your consistency today builds tomorrow\'s success.',
    'Late Night': 'Late night strength! Remember your goals even in challenging moments.'
  }
  
  return messages[timeOfDay] || 'Stay strong on your journey!'
}

export default TimeWidget
