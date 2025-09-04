import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  Wind, 
  Thermometer, 
  Droplets, 
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  MapPin,
  Clock
} from 'lucide-react'

const WeatherForecast = () => {
  const [forecast, setForecast] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState('')

  useEffect(() => {
    fetchWeatherForecast()
  }, [])

  const fetchWeatherForecast = async () => {
    try {
      const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY
      
      if (!apiKey) {
        // Demo data when API key is not available
        setForecast(generateDemoForecast())
        setLocation('Demo City')
        setLoading(false)
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          // Get 5-day forecast
          const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
          )
          const forecastData = await forecastResponse.json()

          // Get weather alerts if available
          try {
            const alertResponse = await fetch(
              `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&appid=${apiKey}&exclude=minutely,hourly`
            )
            const alertData = await alertResponse.json()
            if (alertData.alerts) {
              setAlerts(alertData.alerts)
            }
          } catch (alertError) {
            console.log('Weather alerts not available:', alertError)
          }

          // Process forecast data - get one per day
          const dailyForecast = []
          const processedDates = new Set()

          forecastData.list.forEach(item => {
            const date = new Date(item.dt * 1000).toDateString()
            if (!processedDates.has(date) && dailyForecast.length < 5) {
              processedDates.add(date)
              dailyForecast.push({
                date: new Date(item.dt * 1000),
                temp: Math.round(item.main.temp),
                tempMax: Math.round(item.main.temp_max),
                tempMin: Math.round(item.main.temp_min),
                condition: item.weather[0].main,
                description: item.weather[0].description,
                humidity: item.main.humidity,
                windSpeed: Math.round(item.wind.speed * 3.6), // Convert m/s to km/h
                pressure: item.main.pressure,
                visibility: item.visibility ? Math.round(item.visibility / 1000) : null,
                icon: item.weather[0].icon
              })
            }
          })

          setForecast(dailyForecast)
          setLocation(forecastData.city.name)
          setLoading(false)
        },
        (error) => {
          console.error('Geolocation error:', error)
          setForecast(generateDemoForecast())
          setLocation('Demo City')
          setLoading(false)
        }
      )
    } catch (error) {
      console.error('Weather forecast error:', error)
      setForecast(generateDemoForecast())
      setLocation('Demo City')
      setLoading(false)
    }
  }

  const generateDemoForecast = () => {
    const conditions = ['Clear', 'Clouds', 'Rain', 'Clouds', 'Clear']
    const descriptions = ['clear sky', 'few clouds', 'light rain', 'scattered clouds', 'clear sky']
    
    return Array.from({ length: 5 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
      temp: Math.round(20 + Math.random() * 10),
      tempMax: Math.round(25 + Math.random() * 5),
      tempMin: Math.round(15 + Math.random() * 5),
      condition: conditions[i],
      description: descriptions[i],
      humidity: Math.round(50 + Math.random() * 30),
      windSpeed: Math.round(10 + Math.random() * 15),
      pressure: Math.round(1010 + Math.random() * 20),
      visibility: Math.round(8 + Math.random() * 2),
      icon: '01d'
    }))
  }

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'Clear': return <Sun className="w-8 h-8 text-yellow-400" />
      case 'Clouds': return <Cloud className="w-8 h-8 text-gray-400" />
      case 'Rain': return <CloudRain className="w-8 h-8 text-blue-400" />
      case 'Snow': return <CloudSnow className="w-8 h-8 text-white" />
      default: return <Sun className="w-8 h-8 text-yellow-400" />
    }
  }

  const nextDay = () => {
    if (currentIndex < forecast.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const prevDay = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const formatDate = (date) => {
    if (currentIndex === 0) return 'Today'
    if (currentIndex === 1) return 'Tomorrow'
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/20 rounded w-1/3"></div>
          <div className="h-20 bg-white/20 rounded"></div>
          <div className="h-4 bg-white/20 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  const currentDay = forecast[currentIndex]

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 text-white">
      {/* Header with alerts */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold">{location} Forecast</h3>
        </div>
        {alerts.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-red-500/20 border border-red-400/30 rounded-lg px-3 py-1 flex items-center space-x-1"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-300">{alerts.length} Alert{alerts.length > 1 ? 's' : ''}</span>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevDay}
          disabled={currentIndex === 0}
          className={`p-2 rounded-lg transition-all ${
            currentIndex === 0 
              ? 'opacity-30 cursor-not-allowed' 
              : 'hover:bg-white/10 text-white'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h4 className="text-xl font-bold">{formatDate(currentDay?.date)}</h4>
          <p className="text-white/70 text-sm capitalize">{currentDay?.description}</p>
        </div>

        <button
          onClick={nextDay}
          disabled={currentIndex === forecast.length - 1}
          className={`p-2 rounded-lg transition-all ${
            currentIndex === forecast.length - 1 
              ? 'opacity-30 cursor-not-allowed' 
              : 'hover:bg-white/10 text-white'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Main weather display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center mb-4">
            {getWeatherIcon(currentDay?.condition)}
            <div className="ml-4">
              <div className="text-4xl font-bold">{currentDay?.temp}°C</div>
              <div className="text-white/70">
                H: {currentDay?.tempMax}° L: {currentDay?.tempMin}°
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Weather details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-3 flex items-center space-x-3">
          <Droplets className="w-5 h-5 text-blue-400" />
          <div>
            <div className="text-sm text-white/70">Humidity</div>
            <div className="font-semibold">{currentDay?.humidity}%</div>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-3 flex items-center space-x-3">
          <Wind className="w-5 h-5 text-green-400" />
          <div>
            <div className="text-sm text-white/70">Wind</div>
            <div className="font-semibold">{currentDay?.windSpeed} km/h</div>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-3 flex items-center space-x-3">
          <Thermometer className="w-5 h-5 text-red-400" />
          <div>
            <div className="text-sm text-white/70">Pressure</div>
            <div className="font-semibold">{currentDay?.pressure} hPa</div>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-3 flex items-center space-x-3">
          <Eye className="w-5 h-5 text-purple-400" />
          <div>
            <div className="text-sm text-white/70">Visibility</div>
            <div className="font-semibold">{currentDay?.visibility || 'N/A'} km</div>
          </div>
        </div>
      </div>

      {/* Quick overview of upcoming days */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex justify-between items-center">
          {forecast.slice(0, 5).map((day, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                index === currentIndex 
                  ? 'bg-white/20 scale-105' 
                  : 'hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-xs text-white/70 mb-1">
                {index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : day.date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="mb-1 scale-75">
                {getWeatherIcon(day.condition)}
              </div>
              <div className="text-sm font-semibold">{day.temp}°</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Weather alerts */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-white/10 pt-4 mt-4"
        >
          <h5 className="font-semibold mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 text-red-400 mr-2" />
            Weather Alerts
          </h5>
          {alerts.map((alert, index) => (
            <div key={index} className="bg-red-500/20 border border-red-400/30 rounded-lg p-3 mb-2">
              <div className="font-semibold text-red-300">{alert.event}</div>
              <div className="text-sm text-white/80 mt-1">{alert.description}</div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default WeatherForecast
