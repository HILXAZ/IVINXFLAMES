import React from 'react'
import BreathingSession from '../components/breathing/BreathingSession'
import StatsWidget from '../components/breathing/StatsWidget'
import { useAuth } from '../contexts/AuthContext'
import GlassmorphismCard from '../components/GlassmorphismCard'

export default function Breathing() {
  const { user } = useAuth()
  const userId = user?.id || user?.user?.id
  const apiBase = import.meta.env.VITE_BREATHING_API_BASE || ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <GlassmorphismCard variant="hero" intensity="strong" className="p-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Guided Breathing Sessions ✨
            </h1>
            {userId && (
              <div className="w-full md:w-auto">
                <StatsWidget apiBase={apiBase} userId={userId} />
              </div>
            )}
          </div>
        </GlassmorphismCard>

        <GlassmorphismCard variant="panel" intensity="medium" className="p-6">
          <BreathingSession user={user} apiBase={apiBase} />
        </GlassmorphismCard>
      </div>
    </div>
  )
}
