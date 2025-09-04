import { useEffect, useState, useCallback } from 'react'
import { fetchJoke } from '../api/jokesApi'
import { malayalamJokes } from '../data/malayalamJokes'
import { animeJokes } from '../data/animeJokes'
import { motion } from 'framer-motion'
import { Smile, RefreshCcw, Filter, Volume2, VolumeX } from 'lucide-react'

const enCategories = [
  'Programming', 'Pun', 'Spooky', 'Christmas', 'Misc', 'Dark', 'Anime'
]
const mlCategories = ['General', 'Kids', 'Pun']

export default function Jokes() {
  const [joke, setJoke] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('Programming')
  const [ttsOn, setTtsOn] = useState(true)
  const [lang, setLang] = useState('en') // 'en' | 'ml'

  const speak = useCallback((text) => {
    if (!ttsOn || !text) return
    if (!('speechSynthesis' in window)) return
    const synth = window.speechSynthesis
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 1
    utter.pitch = 1
    synth.cancel()
    synth.speak(utter)
  }, [ttsOn])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      if (lang === 'ml') {
        // filter from local ml list by category; fallback to any if none
        const pool = malayalamJokes.filter(j => j.category === category)
        const pick = (pool.length ? pool : malayalamJokes)[Math.floor(Math.random() * (pool.length ? pool.length : malayalamJokes.length))]
        setJoke(pick)
        const text = pick.type === 'single' ? pick.joke : `${pick.setup} ... ${pick.delivery}`
        // Try pick a Malayalam voice if available
        if ('speechSynthesis' in window) {
          const synth = window.speechSynthesis
          const voices = synth.getVoices()
          const utter = new SpeechSynthesisUtterance(text)
          const mlVoice = voices.find(v => v.lang?.toLowerCase().startsWith('ml'))
          if (mlVoice) utter.voice = mlVoice
          utter.lang = mlVoice?.lang || 'ml-IN'
          utter.rate = 1
          utter.pitch = 1
          if (ttsOn) { synth.cancel(); synth.speak(utter) }
        }
      } else {
        // If Anime selected, use local family-friendly dataset to keep it safe
        if (category === 'Anime') {
          const pick = animeJokes[Math.floor(Math.random() * animeJokes.length)]
          setJoke(pick)
          const text = pick.type === 'single' ? pick.joke : `${pick.setup} ... ${pick.delivery}`
          speak(text)
        } else {
          const data = await fetchJoke({ category, safeMode: true })
          setJoke(data)
          const text = data.type === 'single' ? data.joke : `${data.setup} ... ${data.delivery}`
          speak(text)
        }
      }
    } catch (e) {
      setError(e.message || 'Failed to fetch joke')
    } finally {
      setLoading(false)
    }
  }, [category, speak, lang])

  useEffect(() => { load() }, [])

  // Reset category when language changes
  useEffect(() => {
    setCategory(lang === 'ml' ? 'General' : 'Programming')
  }, [lang])

  const renderJoke = () => {
    if (!joke) return null
    if (joke.type === 'single') {
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-white shadow border border-gray-200">
          <p className="text-lg text-gray-800">{joke.joke}</p>
        </motion.div>
      )
    }
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-white shadow border border-gray-200 space-y-3">
        <p className="text-lg text-gray-900 font-semibold">{joke.setup}</p>
        <p className="text-gray-700">{joke.delivery}</p>
      </motion.div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow">
              <Smile className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Jokes</h1>
              <p className="text-gray-600">Lighten the mood with a safe, family-friendly joke.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'ml' : 'en')} className="px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-sm" title="Toggle language">
              {lang === 'ml' ? 'ML' : 'EN'}
            </button>
            <button onClick={() => setTtsOn(v => !v)} className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50" title={ttsOn ? 'Voice on' : 'Voice off'}>
              {ttsOn ? <Volume2 className="w-5 h-5 text-amber-600" /> : <VolumeX className="w-5 h-5 text-gray-500" />}
            </button>
            <button onClick={load} disabled={loading} className="px-3 py-2 rounded-lg bg-amber-500 text-white shadow hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2">
              <RefreshCcw className="w-4 h-4" />
              New Joke
            </button>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
            <Filter className="w-4 h-4 text-gray-600" />
            <select value={category} onChange={(e)=> setCategory(e.target.value)} className="px-3 py-1.5 rounded-lg text-sm bg-white">
              {(lang === 'ml' ? mlCategories : enCategories).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl">
            {error}
          </div>
        )}

  {loading ? (
          <div className="p-10 bg-white rounded-2xl shadow border border-gray-200 text-center text-gray-600">Loading...</div>
        ) : (
          renderJoke()
        )}
      </div>
    </div>
  )
}
