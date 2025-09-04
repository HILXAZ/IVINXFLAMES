import React, { useCallback, useEffect, useRef, useState } from 'react'
import Vapi from '@vapi-ai/web'
import { useToast } from '../components/Toast'

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
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Live Voice Mentor</h1>
        <div className="flex items-center space-x-2">
          {demoMode && <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">DEMO MODE</span>}
          <span className="text-xs px-2 py-1 rounded bg-gray-100 border">{status}</span>
        </div>
      </div>

      {!PUBLIC_KEY || !ASSISTANT_ID ? (
        <div className="p-4 rounded border border-orange-200 bg-orange-50">
          <h3 className="font-semibold text-orange-800 mb-2">🎙️ Voice Feature Setup Required</h3>
          <p className="text-sm text-orange-700 mb-3">
            To use live voice chat, you need to configure Vapi (Voice AI). In the meantime, try the demo mode!
          </p>
          <div className="flex gap-2">
            <button 
              onClick={startDemo} 
              className="px-3 py-2 rounded bg-blue-600 text-white text-sm"
              disabled={demoMode}
            >
              Start Demo Mode
            </button>
            <button 
              onClick={stopDemo} 
              className="px-3 py-2 rounded bg-gray-200 border text-sm"
              disabled={!demoMode}
            >
              Stop Demo
            </button>
            {demoMode && (
              <button 
                onClick={simulateUserInput} 
                className="px-3 py-2 rounded bg-green-600 text-white text-sm"
              >
                Simulate Conversation
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button onClick={start} className="px-3 py-2 rounded bg-emerald-600 text-white disabled:opacity-50" disabled={status==='live'||status==='connecting'}>Start</button>
          <button onClick={stop} className="px-3 py-2 rounded bg-gray-200 border" disabled={status!=='live' && status!=='connecting'}>Stop</button>
          <button onClick={toggleMute} className="px-3 py-2 rounded bg-blue-600 text-white">{muted ? 'Unmute' : 'Mute'}</button>
        </div>
      )}

      {partial && (
        <div className="p-3 rounded border bg-yellow-50 text-sm">
          <strong>Speaking…</strong> {partial}
        </div>
      )}

      <div className="rounded border bg-white">
        <div className="px-3 py-2 text-xs text-gray-500 border-b">Transcript</div>
        <div className="p-3 space-y-2 max-h-80 overflow-auto text-sm">
          {messages.length === 0 && <div className="text-gray-500">No messages yet.</div>}
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'assistant' ? 'text-gray-900' : 'text-gray-700'}>
              <span className="inline-block min-w-20 font-semibold mr-2 capitalize">{m.role}:</span>
              <span>{m.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
