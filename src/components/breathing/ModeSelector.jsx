import React from 'react'

const modes = [
  { key: '478', label: '4-7-8', pattern: { inhale: 4, hold: 7, exhale: 8 } },
  { key: 'box', label: 'Box', pattern: { inhale: 4, hold: 4, exhale: 4, hold2: 4 } },
  { key: 'custom', label: 'Custom', pattern: null },
]

export default function ModeSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {modes.map(m => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          className={`px-3 py-2 rounded-xl border text-sm font-semibold transition ${value===m.key? 'bg-blue-600 text-white border-blue-600':'bg-white border-gray-300 hover:border-blue-400'}`}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
