import React, { useEffect, useState } from 'react'
import { getBreathingStats } from '../../api/breathingApi'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../Toast'

export default function StatsWidget({ apiBase, userId }) {
  const [stats, setStats] = useState(null)
  const [err, setErr] = useState(null)
  const { session } = useAuth()
  const { push } = useToast()

  useEffect(() => {
    if (!userId) return
    getBreathingStats(apiBase, userId, session)
      .then(r => setStats(r.stats || { total_sessions: 0, total_minutes: 0, current_streak: 0, longest_streak: 0 }))
      .catch(e => {
        setErr(e.message)
        if (e.message.includes('429')) push('Too many requests. Please slow down.', 'error')
        else push('Failed to load stats. Please check your connection.', 'error')
      })
  }, [apiBase, userId, session])

  if (err) return <div className="text-sm text-red-600">{err}</div>
  if (!stats) return <div className="text-sm text-gray-500">Loading stats…</div>

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="rounded-xl border p-3 bg-white">
        <div className="text-xs text-gray-500">Total Sessions</div>
        <div className="text-2xl font-bold">{stats.total_sessions || 0}</div>
      </div>
      <div className="rounded-xl border p-3 bg-white">
        <div className="text-xs text-gray-500">Total Minutes</div>
        <div className="text-2xl font-bold">{stats.total_minutes || 0}</div>
      </div>
      <div className="rounded-xl border p-3 bg-white">
        <div className="text-xs text-gray-500">Current Streak</div>
        <div className="text-2xl font-bold">{stats.current_streak || 0}</div>
      </div>
      <div className="rounded-xl border p-3 bg-white">
        <div className="text-xs text-gray-500">Longest Streak</div>
        <div className="text-2xl font-bold">{stats.longest_streak || 0}</div>
      </div>
    </div>
  )
}
