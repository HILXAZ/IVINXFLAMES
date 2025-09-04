import React, { useState } from 'react'
import GlassmorphismCard from '../components/GlassmorphismCard'
import { motion } from 'framer-motion'

export default function Coach() {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are a supportive, practical addiction recovery coach. Be concise and actionable.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const send = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    setError('')
    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setLoading(true)
    try {
      const res = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.filter(m=>m.role!=='system') })
      })
      if (!res.ok) {
        const t = await res.text()
        setError('Coach error: ' + t)
        setLoading(false)
        return
      }
      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || 'Sorry, no reply.'
      setMessages(m => [...m, { role: 'assistant', content: reply }])
    } catch (e) {
      setError('Network error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
      >
        AI Coach
      </motion.h1>
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 border rounded bg-red-50 text-sm text-red-800"
        >
          {error}
        </motion.div>
      )}
      <GlassmorphismCard variant="panel" intensity="medium" className="p-4">
        <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
          {messages.filter(m=>m.role!=='system').map((m,i)=> (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-3 rounded border ${m.role==='user'?'bg-blue-50 border-blue-200':'bg-gray-50 border-gray-200'}`}
            >
              <div className="text-xs text-gray-500 mb-1">{m.role==='user'?'You':'Coach'}</div>
              <div className="whitespace-pre-wrap text-gray-800">{m.content}</div>
            </motion.div>
          ))}
        </div>
      </GlassmorphismCard>
      
      <GlassmorphismCard variant="floating" intensity="light" className="p-4">
        <div className="flex gap-2">
          <input 
            value={input} 
            onChange={(e)=>setInput(e.target.value)} 
            placeholder="Ask for guidance…" 
            className="flex-1 h-11 px-3 rounded-lg border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm" 
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          />
          <motion.button 
            onClick={send} 
            disabled={loading}
            className="px-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white disabled:opacity-50 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? '...' : 'Send'}
          </motion.button>
        </div>
      </GlassmorphismCard>
    </div>
  )
}
