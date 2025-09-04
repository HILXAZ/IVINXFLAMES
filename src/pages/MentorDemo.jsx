import React, { useEffect, useRef, useState } from 'react'

export default function MentorDemo() {
  const [log, setLog] = useState([])
  const wsRef = useRef(null)

  useEffect(() => {
  const url = (import.meta.env.VITE_MENTOR_WS || '') + '/ws/mentor'
    const ws = new WebSocket(url)
    wsRef.current = ws
    ws.onmessage = (ev) => {
      const msg = (() => { try { return JSON.parse(ev.data) } catch { return { type: 'bin' } } })()
      setLog(l => [...l.slice(-100), msg])
    }
    return () => ws.close()
  }, [])

  const endTurn = () => {
    wsRef.current?.send(JSON.stringify({ type: 'audio.endTurn' }))
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Mentor Demo (WS mock)</h1>
      <p className="text-sm text-gray-600">Click "End Turn" to simulate a user utterance end; the server streams a mock response.</p>
      <div className="flex gap-2">
        <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={endTurn}>End Turn</button>
      </div>
      <pre className="bg-gray-50 border rounded p-3 h-64 overflow-auto text-xs">{log.map((m,i)=>JSON.stringify(m)).join('\n')}</pre>
    </div>
  )
}
