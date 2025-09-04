import React, { useState } from 'react'

export default function RapidCoach() {
  const [profile, setProfile] = useState('I want to quit smoking and build a running habit.')
  const [advice, setAdvice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchAdvice = async () => {
    setLoading(true)
    setError('')
    setAdvice('')
    try {
  const payload = { messages: [{ role: 'user', content: `Profile: ${profile}. Give me a concise, practical 5-step plan.` }], temperature: 0.6 }
  const res = await fetch('/api/coach/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  const text = data?.choices?.[0]?.message?.content?.trim() || 'No advice available.'
      setAdvice(text)
    } catch (e) {
      setError(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
  <h1 className="text-2xl font-bold">AI Coach (Gemini)</h1>
      <div className="bg-white border rounded-xl shadow-sm p-4 space-y-3">
        <textarea value={profile} onChange={e=>setProfile(e.target.value)} rows={5} className="w-full border rounded p-2" />
        <button onClick={fetchAdvice} disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">{loading?'Loading…':'Get Advice'}</button>
        {error && <div className="p-2 text-sm text-red-800 bg-red-50 border rounded">{error}</div>}
        {advice && <pre className="p-3 bg-gray-50 border rounded whitespace-pre-wrap text-sm">{advice}</pre>}
      </div>
    </div>
  )
}
