import { useEffect, useState } from 'react'
import { Sun, CloudRain, Cloud, Thermometer, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY

function iconFor(condition) {
  switch (condition) {
    case 'Rain': return <CloudRain className="h-4 w-4 text-blue-600" />
    case 'Clear': return <Sun className="h-4 w-4 text-yellow-500" />
    case 'Clouds': return <Cloud className="h-4 w-4 text-gray-600" />
    default: return <Thermometer className="h-4 w-4 text-rose-600" />
  }
}

export default function WeatherMini() {
  const [coords, setCoords] = useState(null)
  const [weather, setWeather] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setCoords({ lat: 40.7128, lon: -74.006 })
    )
  }, [])

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!coords) return
      try {
        if (!WEATHER_API_KEY) {
          setWeather({ temp: 22, condition: 'Clear', description: 'clear sky', city: 'Demo City' })
          setError('Demo')
          return
        }
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${WEATHER_API_KEY}&units=metric`
        const res = await fetch(url)
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Weather failed')
        if (cancelled) return
        setWeather({
          temp: Math.round(data.main.temp),
          condition: data.weather?.[0]?.main || 'Unknown',
          description: data.weather?.[0]?.description || '',
          city: data.name,
        })
      } catch (_e) {
        if (!cancelled) setError('Error')
      }
    }
    run()
    return () => { cancelled = true }
  }, [coords])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30 px-3 py-2 shadow-sm"
      title={error === 'Demo' ? 'Demo weather: add VITE_OPENWEATHERMAP_API_KEY for live data' : ''}
    >
      <div className="flex items-center gap-1 text-xs text-gray-700">
        {iconFor(weather?.condition)}
        <span className="font-semibold">{weather ? `${weather.temp}°C` : '—'}</span>
        <span className="text-gray-500">• {weather?.condition || 'Loading'}</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <MapPin className="h-3.5 w-3.5" />
        <span className="truncate max-w-[120px]">{weather?.city || (coords ? `${coords.lat.toFixed(2)}, ${coords.lon.toFixed(2)}` : 'Locating…')}</span>
      </div>
    </motion.div>
  )
}
