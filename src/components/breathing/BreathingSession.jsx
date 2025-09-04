import React, { useEffect, useMemo, useRef, useState } from 'react'
import ModeSelector from './ModeSelector'
import MoodPicker from './MoodPicker'
import { playAmbient, stopAmbient } from '../../utils/ambientSounds'
import { startBreathingSession, endBreathingSession } from '../../api/breathingApi'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../Toast'

function useTimerCycle(pattern, playing) {
  const [phase, setPhase] = useState('inhale')
  const [tick, setTick] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)
  const timerRef = useRef(null)

  const sequence = useMemo(() => {
    if (!pattern) return []
    const parts = []
    if (pattern.inhale) parts.push(['inhale', pattern.inhale])
    if (pattern.hold) parts.push(['hold', pattern.hold])
    if (pattern.exhale) parts.push(['exhale', pattern.exhale])
    if (pattern.hold2) parts.push(['hold2', pattern.hold2])
    return parts
  }, [pattern])

  useEffect(() => {
    if (!playing || sequence.length === 0) return
    let idx = 0
    setPhase(sequence[0][0])
    setTick(sequence[0][1])
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTick((t) => {
        if (t > 1) return t - 1
        // move to next phase
        idx = (idx + 1) % sequence.length
        setPhase(sequence[idx][0])
        if (idx === 0) setCycleCount(c => c + 1)
        return sequence[idx][1]
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [playing, sequence])

  return { phase, secondsLeft: tick, cycleCount }
}

function modeToPattern(mode, custom) {
  if (mode === '478') return { inhale: 4, hold: 7, exhale: 8 }
  if (mode === 'box') return { inhale: 4, hold: 4, exhale: 4, hold2: 4 }
  return custom || { inhale: 4, hold: 0, exhale: 6 }
}

export default function BreathingSession({ user, apiBase = 'http://localhost:5174' }) {
  const userId = user?.id || user?.user?.id
  const { session } = useAuth()
  const { push } = useToast()
  const [mode, setMode] = useState('478')
  const [custom, setCustom] = useState({ inhale: 4, hold: 0, exhale: 6 })
  const [moodBefore, setMoodBefore] = useState('stressed')
  const [moodAfter, setMoodAfter] = useState('calm')
  const [ambient, setAmbient] = useState('none')
  const [playing, setPlaying] = useState(false)
  const [startTs] = useState(() => Date.now())
  const [sessionId, setSessionId] = useState(null)
  const pattern = useMemo(() => modeToPattern(mode, custom), [mode, custom])

  const { phase, secondsLeft, cycleCount } = useTimerCycle(pattern, playing)

  // Ambient control
  useEffect(() => {
    if (!playing || ambient === 'none') { stopAmbient(); return }
    playAmbient(ambient)
    return () => stopAmbient()
  }, [playing, ambient])

  // Start on first play
  useEffect(() => {
    if (playing && !sessionId && userId) {
      startBreathingSession(apiBase, { mode, mood_before: moodBefore }, session)
        .then(r => setSessionId(r.session.id))
        .catch((e) => {
          if (String(e).includes('429')) push('Too many requests. Please try again shortly.', 'error')
          else push('Could not start the session. Check your network.', 'error')
          setPlaying(false)
        })
    }
  }, [playing, sessionId, userId, apiBase, mode, moodBefore, session])

  const endSession = async () => {
    setPlaying(false)
    stopAmbient()
    if (sessionId && userId) {
      const duration = Math.max(1, Math.round((Date.now() - startTs) / 1000))
      try {
        await endBreathingSession(apiBase, { session_id: sessionId, cycles: cycleCount, duration, mood_after: moodAfter }, session)
      } catch (e) {
        if (String(e).includes('429')) push('Too many requests. Please try again shortly.', 'error')
        else push('Could not save the session. We will retry later.', 'error')
      }
    }
  }

  const orbScale = phase === 'inhale' ? 1.2 : phase === 'exhale' ? 0.8 : 1

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="rounded-2xl border bg-white p-4 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <ModeSelector value={mode} onChange={setMode} />
          {mode === 'custom' && (
            <div className="flex items-center gap-2 text-sm">
              <label>Inhale
                <input type="number" min={1} max={12} value={custom.inhale} onChange={e => setCustom({ ...custom, inhale: +e.target.value })} className="ml-1 w-16 border rounded px-2 py-1" />
              </label>
              <label>Hold
                <input type="number" min={0} max={12} value={custom.hold} onChange={e => setCustom({ ...custom, hold: +e.target.value })} className="ml-1 w-16 border rounded px-2 py-1" />
              </label>
              <label>Exhale
                <input type="number" min={1} max={16} value={custom.exhale} onChange={e => setCustom({ ...custom, exhale: +e.target.value })} className="ml-1 w-16 border rounded px-2 py-1" />
              </label>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <MoodPicker title="Mood before" value={moodBefore} onChange={setMoodBefore} />
          <div>
            <div className="text-sm font-semibold mb-2 text-gray-700">Background sound</div>
            <div className="flex flex-wrap gap-2">
              {['none','rain','ocean','forest'].map(n => (
                <button key={n} onClick={() => setAmbient(n)} className={`px-3 py-1.5 rounded-lg border text-sm ${ambient===n? 'bg-indigo-600 text-white border-indigo-600':'bg-white border-gray-300 hover:border-indigo-400'}`}>{n}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center py-8">
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 rounded-full" style={{
              transform: `scale(${orbScale})`,
              transition: 'transform 1s ease-in-out',
              background: 'radial-gradient(circle at 30% 30%, rgba(59,130,246,0.9), rgba(99,102,241,0.7))',
              boxShadow: '0 20px 60px rgba(79,70,229,0.35)'
            }} />
            <div className="absolute inset-0 rounded-full flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-2xl font-bold capitalize">{phase}</div>
                <div className="text-4xl font-black mt-1">{Math.max(0, secondsLeft || 0)}</div>
                <div className="text-xs uppercase tracking-wide opacity-80 mt-2">cycles: {cycleCount}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-center">
          {!playing ? (
            <button onClick={() => setPlaying(true)} className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold">Start</button>
          ) : (
            <>
              <button onClick={() => setPlaying(false)} className="px-6 py-3 rounded-xl bg-amber-500 text-white font-bold">Pause</button>
              <button onClick={endSession} className="px-6 py-3 rounded-xl bg-rose-600 text-white font-bold">End</button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <MoodPicker title="Mood after" value={moodAfter} onChange={setMoodAfter} />
      </div>
    </div>
  )
}
