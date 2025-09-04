import React from 'react'

const moods = [
  { key: 'stressed', label: 'Stressed' },
  { key: 'anxious', label: 'Anxious' },
  { key: 'neutral', label: 'Neutral' },
  { key: 'calm', label: 'Calm' },
  { key: 'relaxed', label: 'Relaxed' },
]

export default function MoodPicker({ value, onChange, title }) {
  return (
    <div>
      <div className="text-sm font-semibold mb-2 text-gray-700">{title}</div>
      <div className="flex flex-wrap gap-2">
        {moods.map(m => (
          <button
            key={m.key}
            onClick={() => onChange(m.key)}
            className={`px-3 py-1.5 rounded-lg border text-sm ${value===m.key? 'bg-emerald-600 text-white border-emerald-600':'bg-white border-gray-300 hover:border-emerald-400'}`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  )
}
