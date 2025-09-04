import express from 'express'
import http from 'http'
import cors from 'cors'
import { WebSocketServer } from 'ws'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.post('/api/sessions/start', (_req, res) => res.json({ sessionId: crypto.randomUUID() }))
app.post('/api/sessions/end', (_req, res) => res.json({ ok: true }))
app.get('/api/sessions/recent', (_req, res) => res.json({ sessions: [] }))

const server = http.createServer(app)
const wss = new WebSocketServer({ server, path: '/ws/mentor' })

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'ready' }))
  let speaking = false
  ws.on('message', (data, isBinary) => {
    if (isBinary) {
      ws.send(JSON.stringify({ type: 'stt.partial', text: '...' }))
      return
    }
    try {
      const msg = JSON.parse(data.toString())
      if (msg.type === 'audio.endTurn') {
        const text = 'Let’s do a quick breathing exercise. Inhale... Exhale...'
        speaking = true
        for (const token of text.split(' ')) {
          ws.send(JSON.stringify({ type: 'ai.token', token }))
        }
        ws.send(JSON.stringify({ type: 'ai.final', text }))
        ws.send(JSON.stringify({ type: 'tts.chunk', seq: 0 }))
        ws.send(JSON.stringify({ type: 'tts.done' }))
        speaking = false
        return
      }
      if (msg.type === 'barge.in' && speaking) {
        ws.send(JSON.stringify({ type: 'tts.stop' }))
        speaking = false
      }
    } catch {}
  })
})

const PORT = process.env.MENTOR_PORT || 5280
server.listen(PORT, () => console.log(`[mentor] WS+HTTP on :${PORT}`))
