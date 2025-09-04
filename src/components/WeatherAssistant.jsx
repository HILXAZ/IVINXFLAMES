import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CloudRain, Sun, Cloud, Thermometer, MapPin, Loader2 } from 'lucide-react'
import WonderButton from './WonderButton'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY

function getIcon(condition) {
  switch (condition) {
    case 'Rain':
      return <CloudRain className="h-6 w-6 text-blue-600" />
    case 'Clear':
      return <Sun className="h-6 w-6 text-yellow-500" />
    case 'Clouds':
      return <Cloud className="h-6 w-6 text-gray-600" />
    default:
      return <Thermometer className="h-6 w-6 text-rose-600" />
  }
}

function suggestActivity(condition) {
  switch (condition) {
    case 'Rain':
      return 'It’s rainy. Try a guided indoor meditation or breathing session.'
    case 'Clear':
      return 'Great weather! A short walk outside could lift your mood.'
    case 'Clouds':
      return 'Cloudy skies. Consider journaling or a cozy tea + reading.'
    default:
      return 'Stay balanced – a 3-minute mindful breathing can help.'
  }
}

export default function WeatherAssistant({ onSaved }) {
  const { user } = useAuth()
  const [coords, setCoords] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [weather, setWeather] = useState(null)
  const [saving, setSaving] = useState(false)
  const [mood, setMood] = useState('')
  const [craving, setCraving] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        // Always try to get location, even without API key
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (cancelled) return
              const { latitude, longitude } = pos.coords
              setCoords({ lat: latitude, lon: longitude })
              resolve()
            },
            () => {
              if (cancelled) return
              // Use fallback coordinates (New York City)
              const fallback = { lat: 40.7128, lon: -74.006 }
              setCoords(fallback)
              resolve()
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 600000 }
          )
        })
      } catch (e) {
        console.error(e)
        // Even if geolocation fails, set fallback coordinates
        setCoords({ lat: 40.7128, lon: -74.006 })
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function fetchWeather() {
      if (!coords) return
      
      // If no API key, use demo data
      if (!WEATHER_API_KEY) {
        const demoWeather = {
          temp: 22,
          condition: 'Clear',
          description: 'clear sky',
          city: 'Demo City'
        }
        setWeather(demoWeather)
        setError('Using demo weather data. Add VITE_OPENWEATHERMAP_API_KEY to .env for real weather.')
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${WEATHER_API_KEY}&units=metric`
        const res = await fetch(url)
        const data = await res.json()
        if (cancelled) return
        if (!res.ok) throw new Error(data?.message || 'Failed to fetch weather')
        const condensed = {
          temp: Math.round(data.main.temp),
          condition: data.weather?.[0]?.main || 'Unknown',
          description: data.weather?.[0]?.description || '',
          city: data.name,
        }
        setWeather(condensed)
        setError(null)
      } catch (e) {
        console.error(e)
        setError('Could not load weather. Check API key and connection.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchWeather()
    return () => { cancelled = true }
  }, [coords])

  const onSave = async () => {
    if (!weather) return
    setSaving(true)
    try {
      // Try saving to Supabase if configured; in demo mode, writes are disabled (handled by supabase mock)
      const payload = {
        created_at: new Date().toISOString(),
        condition: weather.condition,
        description: weather.description,
        temp_c: weather.temp,
        city: weather.city || null,
  user_id: user?.id || null,
  mood: mood || null,
  craving_level: typeof craving === 'number' ? craving : null,
  suggestion: suggestActivity(weather.condition)
      }
      const { data, error } = await supabase
        .from('weather_logs')
        .insert(payload)
        .select()
        .single()

      if (error) {
        // In demo mode this will surface a friendly message; we treat it as non-fatal
        console.warn('Weather log not persisted (likely demo mode):', error.message)
      }
      onSaved && onSaved(data || payload)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const condition = weather?.condition
  const suggestion = suggestActivity(condition)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/30 backdrop-blur-xl rounded-2xl border border-white/20 p-5 shadow-xl"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            {condition && getIcon(condition)}
            <h3 className="text-lg font-semibold text-gray-900">Weather & You</h3>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Personalized suggestions based on local weather.
          </p>
        </div>
        {coords && (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>
              {weather?.city ? weather.city + ' • ' : ''}{coords.lat.toFixed(2)},{' '}
              {coords.lon.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading weather…</span>
          </div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : weather ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {getIcon(condition)}
              <div>
                <div className="text-gray-900 font-medium">
                  {weather.description} • {weather.temp}°C
                </div>
                <div className="text-xs text-gray-500">Condition: {condition}</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-700">{suggestion}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1">Your mood</label>
                <select
                  className="rounded-lg border border-gray-200 bg-white/70 px-3 py-2 text-sm"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                >
                  <option value="">Select…</option>
                  <option>Great</option>
                  <option>Okay</option>
                  <option>Low</option>
                  <option>Anxious</option>
                  <option>Stressed</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1">Craving level: {craving}</label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={craving}
                  onChange={(e) => setCraving(parseInt(e.target.value, 10))}
                />
              </div>
              <div className="flex items-end">
                <WonderButton onClick={onSave} disabled={saving} size="sm" className="w-full">
                  {saving ? 'Saving…' : 'Save weather + mood'}
                </WonderButton>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}
