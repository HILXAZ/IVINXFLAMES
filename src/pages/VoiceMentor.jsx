import React, { useCallback, useEffect, useRef, useState } from 'react'
import Vapi from '@vapi-ai/web'
import { useToast } from '../components/Toast'
import OppenheimerBackground from '../components/OppenheimerBackground'

export default function VoiceMentor() {
  const { push } = useToast()
  const vapiRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle | connecting | live | stopped | error
  const [muted, setMuted] = useState(false)
  const [partial, setPartial] = useState('')
  const [messages, setMessages] = useState([])
  const [demoMode, setDemoMode] = useState(false)

  const PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY
  const ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID

  // Demo responses for testing
  const demoResponses = [
    "Hello! I'm your AI recovery mentor. How are you feeling today?",
    "I understand that recovery can be challenging. Remember, every day is a new opportunity to grow stronger.",
    "Let's practice a quick breathing exercise together. Take a deep breath in for 4 counts...",
    "You're doing great by reaching out for support. What would you like to talk about?",
    "Remember, setbacks don't define you. What matters is how you respond and keep moving forward."
  ]

  const startDemo = useCallback(() => {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
    setDemoMode(true)
    setStatus('live')
    setMessages([{ role: 'assistant', text: demoResponses[0] }])
    push('Demo mode activated - Try saying something!', 'success')
  }, [push])

  const stopDemo = useCallback(() => {
    setDemoMode(false)
    setStatus('stopped')
    setMessages([])
    setPartial('')
  }, [])

  const simulateUserInput = useCallback(() => {
    if (!demoMode) return
    
    const userMessages = [
      "I'm feeling anxious today",
      "I had a difficult moment yesterday",
      "Can you help me with breathing?",
      "I want to stay on track",
      "Thank you for the support"
    ]
    
    const randomUser = userMessages[Math.floor(Math.random() * userMessages.length)]
    const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)]
    
    setMessages(prev => [
      ...prev,
      { role: 'user', text: randomUser },
      { role: 'assistant', text: randomResponse }
    ])
  }, [demoMode])

  useEffect(() => {
    if (!PUBLIC_KEY) return
    try {
      vapiRef.current = new Vapi(PUBLIC_KEY)
      const vapi = vapiRef.current
      vapi.on('status', (s) => setStatus(String(s)))
      vapi.on('error', (e) => {
        setStatus('error')
        push('Voice error. Check mic permission and keys.', 'error')
        // eslint-disable-next-line no-console
        console.error('[vapi:error]', e)
      })
      vapi.on('transcript', (t) => {
        if (!t) return
        if (t.final) {
          setMessages(m => [...m, { role: 'user', text: t.text }])
          setPartial('')
        } else {
          setPartial(t.text || '')
        }
      })
      vapi.on('message', (m) => {
        if (!m) return
        const text = m?.content || m?.text || ''
        if (text) setMessages((prev) => [...prev, { role: m.role || 'assistant', text }])
      })
    } catch (e) {
      setStatus('error')
      // eslint-disable-next-line no-console
      console.error('[vapi:init]', e)
    }
    return () => {
      try { vapiRef.current?.stop?.() } catch {}
      vapiRef.current = null
    }
  }, [PUBLIC_KEY, push])

  const start = useCallback(async () => {
    if (!PUBLIC_KEY || !ASSISTANT_ID) {
      // Instead of showing error, show helpful message
      push('Voice feature requires Vapi setup. Check console for setup instructions.', 'info')
      console.log(`
🎙️ VAPI SETUP INSTRUCTIONS:
1. Sign up at https://vapi.ai
2. Get your Public Key from dashboard
3. Create a voice assistant and get Assistant ID
4. Add these to your .env file:
   VITE_VAPI_PUBLIC_KEY=your_public_key_here
   VITE_VAPI_ASSISTANT_ID=your_assistant_id_here
5. Restart the development server
      `)
      return
    }
    try {
      setStatus('connecting')
      await vapiRef.current?.start(ASSISTANT_ID)
      setStatus('live')
    } catch (e) {
      setStatus('error')
      push('Could not start voice. Check permissions and keys.', 'error')
    }
  }, [ASSISTANT_ID, PUBLIC_KEY, push])

  const stop = useCallback(async () => {
    try {
      await vapiRef.current?.stop()
      setStatus('stopped')
    } catch {}
  }, [])

  const toggleMute = useCallback(() => {
    try {
      const next = !muted
      setMuted(next)
      vapiRef.current?.setMuted?.(next)
    } catch {}
  }, [muted])

  return (
    <OppenheimerBackground>
      <div className="relative z-10 max-w-4xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">Live Voice Mentor</h1>
          <div className="flex items-center space-x-2">
            {demoMode && <span className="text-xs px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">DEMO MODE</span>}
            <span className="text-xs px-3 py-1.5 rounded-full bg-white/20 text-white border border-white/30">{status}</span>
          </div>
        </div>

      {!PUBLIC_KEY || !ASSISTANT_ID ? (
        <div className="p-6 rounded-2xl border border-orange-400/30 bg-orange-500/10 backdrop-blur-xl">
          <h3 className="font-semibold text-orange-200 mb-3 text-lg">🎙️ Voice Feature Setup Required</h3>
          <p className="text-sm text-orange-100 mb-4 leading-relaxed">
            To use live voice chat, you need to configure Vapi (Voice AI). In the meantime, try the demo mode!
          </p>
          <div className="flex gap-3 flex-wrap">
            <button 
              onClick={startDemo} 
              className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              disabled={demoMode}
            >
              Start Demo Mode
            </button>
            <button 
              onClick={stopDemo} 
              className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              disabled={!demoMode}
            >
              Stop Demo
            </button>
            {demoMode && (
              <button 
                onClick={simulateUserInput} 
                className="px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Simulate Conversation
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex gap-3 flex-wrap bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
          <button onClick={start} className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium disabled:opacity-50 transition-all duration-200 shadow-lg" disabled={status==='live'||status==='connecting'}>Start Voice</button>
          <button onClick={stop} className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white font-medium transition-all duration-200 shadow-lg" disabled={status!=='live' && status!=='connecting'}>Stop Voice</button>
          <button onClick={toggleMute} className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all duration-200 shadow-lg">{muted ? 'Unmute' : 'Mute'}</button>
        </div>
      )}

      {partial && (
        <div className="p-4 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 text-yellow-100 text-sm backdrop-blur-xl shadow-lg">
          <strong className="text-yellow-200">Speaking…</strong> {partial}
        </div>
      )}

      <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-xl">
        <div className="px-4 py-3 text-sm text-gray-200 border-b border-white/20 bg-white/5 rounded-t-2xl font-medium">Transcript</div>
        <div className="p-4 space-y-3 max-h-80 overflow-auto text-sm">
          {messages.length === 0 && <div className="text-gray-300 italic">No messages yet. Start a conversation!</div>}
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'assistant' ? 'text-blue-200' : 'text-green-200'}>
              <span className="inline-block min-w-20 font-semibold mr-3 capitalize text-white bg-white/20 px-2 py-1 rounded-lg">{m.role}:</span>
              <span className="leading-relaxed">{m.text}</span>
            </div>
          ))}
        </div>
      </div>
      </div>
    </OppenheimerBackground>
  )
}
