import express from 'express'
import http from 'http'
import cors from 'cors'
import { WebSocketServer } from 'ws'

// Minimal mock STT/TTS pipeline for local dev
type ClientEvent = { type: string; [k: string]: any }

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true }))

// Session endpoints (mock)
app.post('/api/sessions/start', (req, res) => {
  const id = crypto.randomUUID()
  res.json({ sessionId: id })
})
app.post('/api/sessions/end', (req, res) => {
  res.json({ ok: true })
})
app.get('/api/sessions/recent', (_req, res) => {
  res.json({ sessions: [] })
})

const server = http.createServer(app)
const wss = new WebSocketServer({ server, path: '/ws/mentor' })

wss.on('connection', (ws) => {
  // Emit a ready event
  ws.send(JSON.stringify({ type: 'ready' }))

  let speaking = false
  ws.on('message', (data, isBinary) => {
    if (isBinary) {
      // Pretend we decoded PCM -> STT partial
      ws.send(JSON.stringify({ type: 'stt.partial', text: '...' }))
      return
    }
    const msg: ClientEvent = JSON.parse(data.toString())
    if (msg.type === 'audio.endTurn') {
      // Produce a small AI reply and stream tokens
      const text = 'Let’s do a quick breathing exercise. Inhale... Exhale...'
      speaking = true
      for (const token of text.split(' ')) {
        ws.send(JSON.stringify({ type: 'ai.token', token }))
      }
      ws.send(JSON.stringify({ type: 'ai.final', text }))
      // Mock TTS chunks
      ws.send(JSON.stringify({ type: 'tts.chunk', seq: 0 }))
      ws.send(JSON.stringify({ type: 'tts.done' }))
      speaking = false
      return
    }
    if (msg.type === 'barge.in' && speaking) {
      // stop talking
      ws.send(JSON.stringify({ type: 'tts.stop' }))
      speaking = false
    }
  })
})

const PORT = process.env.MENTOR_PORT || 5280
server.listen(PORT, () => console.log(`[mentor] WS+HTTP on :${PORT}`))
