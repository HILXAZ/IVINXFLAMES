import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const app = express()
app.use(cors())
app.use(express.json())

// Supabase client (server-side) using env vars
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth middleware: verify Supabase JWT from Authorization header
async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Missing bearer token' })
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid token' })
    req.authUser = data.user
    next()
  } catch (_e) {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

// Helper: update user_stats aggregate
async function updateStats(user_id, deltaMinutes, completedAt) {
  const { data: existing } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user_id)
    .maybeSingle()

  const today = new Date(completedAt || Date.now())
  const todayStr = today.toISOString().slice(0, 10)
  let payload = {}

  if (!existing) {
    payload = {
      user_id,
      total_sessions: 1,
      total_minutes: Math.max(0, Math.round(deltaMinutes)),
      current_streak: 1,
      longest_streak: 1,
      last_session_date: todayStr,
    }
  } else {
    const last = existing.last_session_date
    const lastDate = last ? new Date(last) : null
    const dayMs = 24 * 60 * 60 * 1000
    let current_streak = existing.current_streak || 0
    let longest_streak = existing.longest_streak || 0

    if (lastDate) {
      const diffDays = Math.floor((today.setHours(0, 0, 0, 0) - new Date(lastDate).setHours(0, 0, 0, 0)) / dayMs)
      if (diffDays === 1) current_streak += 1
      else if (diffDays > 1) current_streak = 1
    } else {
      current_streak = Math.max(1, current_streak)
    }
    longest_streak = Math.max(longest_streak, current_streak)

    payload = {
      total_sessions: (existing.total_sessions || 0) + 1,
      total_minutes: (existing.total_minutes || 0) + Math.max(0, Math.round(deltaMinutes)),
      current_streak,
      longest_streak,
      last_session_date: todayStr,
    }
  }

  const { error } = existing
    ? await supabase.from('user_stats').update(payload).eq('user_id', user_id)
    : await supabase.from('user_stats').insert(payload)
  if (error) throw error
}

// Start a breathing session
app.post('/api/breathing/start', requireAuth, async (req, res) => {
  try {
    const { mode, mood_before } = req.body
    const user_id = req.authUser.id
    if (!mode) return res.status(400).json({ error: 'mode is required' })
    const { data, error } = await supabase
      .from('breathing_sessions')
      .insert({ user_id, start_time: new Date().toISOString(), mode, mood_before })
      .select()
      .single()
    if (error) throw error
    res.json({ session: data })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// End a breathing session
app.post('/api/breathing/end', requireAuth, async (req, res) => {
  try {
    const { session_id, cycles, duration, mood_after } = req.body
    const user_id = req.authUser.id
    if (!session_id) return res.status(400).json({ error: 'session_id is required' })
    const endTime = new Date().toISOString()
    const updates = { end_time: endTime, cycles, duration, mood_after }
    const { data, error } = await supabase
      .from('breathing_sessions')
      .update(updates)
      .eq('id', session_id)
      .eq('user_id', user_id)
      .select()
      .single()
    if (error) throw error

    await updateStats(user_id, (duration || 0) / 60, endTime)
    res.json({ session: data })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }))

// Public feedback endpoint: accepts simple feedback and stores in Supabase
app.post('/api/feedback', async (req, res) => {
  try {
    const { name = '', email = '', message = '', rating = null } = req.body || {}

    const clean = {
      name: String(name).trim().slice(0, 120),
      email: String(email).trim().slice(0, 200),
      message: String(message).trim().slice(0, 2000),
      rating: Number.isFinite(Number(rating)) ? Math.max(1, Math.min(5, Number(rating))) : null,
    }
    if (!clean.message) return res.status(400).json({ error: 'Message is required' })

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE
    const admin = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : supabase

    const payload = {
      name: clean.name || null,
      email: clean.email || null,
      message: clean.message,
      rating: clean.rating,
      user_id: null,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await admin
      .from('feedback')
      .insert(payload)
      .select()
      .maybeSingle()
    if (error) return res.status(500).json({ error: error.message })
    res.json({ ok: true, id: data?.id || null })
  } catch (e) {
    res.status(500).json({ error: e.message || 'Unknown error' })
  }
})

// Deepgram STT proxy
app.post('/api/stt/deepgram', express.raw({ type: '*/*', limit: '25mb' }), async (req, res) => {
  try {
    const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY
    if (!DEEPGRAM_API_KEY) return res.status(500).json({ error: 'Missing DEEPGRAM_API_KEY on server' })

    const contentType = req.headers['content-type'] || 'application/octet-stream'
    const bodyBuffer = req.body
    if (!bodyBuffer || !bodyBuffer.length) return res.status(400).json({ error: 'No audio provided' })

    // Language handling: default en-US; support Malayalam (ml / ml-IN) via ?lang query
    const rawLang = (req.query.lang || '').toString().trim()
    let dgLang = 'en-US'
    if (rawLang) {
      const lower = rawLang.toLowerCase()
      if (lower === 'ml' || lower === 'ml-in') dgLang = 'ml'
      else if (lower === 'en' || lower === 'en-us' || lower === 'en-gb') dgLang = 'en-US'
      else dgLang = 'en-US' // restrict to supported
    }

    const url = `https://api.deepgram.com/v1/listen?model=nova-2-general&smart_format=true&filler_words=false&language=${encodeURIComponent(dgLang)}`
    const dgResp = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Token ${DEEPGRAM_API_KEY}`, 'Content-Type': contentType },
      body: bodyBuffer
    })
    if (!dgResp.ok) {
      const text = await dgResp.text().catch(() => '')
      return res.status(502).json({ error: `Deepgram error ${dgResp.status}`, details: text })
    }
    const data = await dgResp.json()
    const transcript = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
    return res.json({ transcript, provider: 'deepgram' })
  } catch (e) {
    console.error('Deepgram STT error:', e)
    return res.status(500).json({ error: e.message })
  }
})

// Chatbot (Gemini only) — English-only responses
app.post('/api/coach/chat', async (req, res) => {
  try {
    const { messages, model, temperature } = req.body || {}
    if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: 'messages required' })

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY
    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'Missing GEMINI_API_KEY' })

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const modelName = 'gemini-2.0-flash'
    const temperatureSafe = typeof temperature === 'number' ? temperature : 0.7
    const system = 'You are a supportive, practical addiction recovery coach. Respond only in English. Keep answers concise and actionable.'

    const lastMessage = messages[messages.length - 1]
    const userPrompt = lastMessage?.content || ''
    const prompt = `${system}\n\nUser: ${userPrompt}\n\nAssistant:`

    const modelInst = genAI.getGenerativeModel({ model: modelName, generationConfig: { temperature: temperatureSafe, maxOutputTokens: 500 } })
    const result = await modelInst.generateContent(prompt)
    const text = result.response.text() || 'Sorry, I could not generate a response.'

    res.json({ choices: [{ message: { role: 'assistant', content: text } }] })
  } catch (e) {
    console.error('Gemini API Error:', e)
    res.status(500).json({ error: `Gemini API error: ${e.message}` })
  }
})

export default app

// Utility: Parse ISO8601 duration (e.g., PT15M12S) to minutes (integer)
function isoDurationToMinutes(iso) {
  try {
    const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!m) return 0
    const h = parseInt(m[1] || '0', 10)
    const min = parseInt(m[2] || '0', 10)
    const s = parseInt(m[3] || '0', 10)
    return Math.max(1, Math.round(h * 60 + min + s / 60))
  } catch { return 0 }
}

// YouTube search proxy: returns embeddable videos for a query
app.get('/api/youtube/search', async (req, res) => {
  try {
    const YT_KEY = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY
    if (!YT_KEY) return res.status(500).json({ error: 'Missing YOUTUBE_API_KEY' })

    const q = (req.query.q || '').toString().trim()
    const max = Math.min(25, Math.max(1, parseInt(req.query.max || '10', 10) || 10))
    if (!q) return res.status(400).json({ error: 'q required' })

    // First: search for embeddable videos
    const searchParams = new URLSearchParams({
      key: YT_KEY,
      part: 'snippet',
      q,
      maxResults: String(max),
      type: 'video',
      videoEmbeddable: 'true',
      safeSearch: 'strict'
    })
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?${searchParams}`
    const sResp = await fetch(searchUrl)
    if (!sResp.ok) {
      const text = await sResp.text().catch(() => '')
      return res.status(502).json({ error: 'YouTube search failed', details: text })
    }
    const sJson = await sResp.json()
    const ids = (sJson.items || []).map(it => it?.id?.videoId).filter(Boolean)
    if (!ids.length) return res.json({ items: [] })

    // Then: get details for duration and stats
    const vidParams = new URLSearchParams({
      key: YT_KEY,
      part: 'contentDetails,statistics,snippet',
      id: ids.join(',')
    })
    const vidUrl = `https://www.googleapis.com/youtube/v3/videos?${vidParams}`
    const vResp = await fetch(vidUrl)
    if (!vResp.ok) {
      const text = await vResp.text().catch(() => '')
      return res.status(502).json({ error: 'YouTube videos fetch failed', details: text })
    }
    const vJson = await vResp.json()
    const category = (req.query.category || '').toString()
    const items = (vJson.items || []).map(v => {
      const videoId = v.id
      const title = v.snippet?.title || ''
      const description = v.snippet?.description || ''
      const thumb = v.snippet?.thumbnails?.high?.url || v.snippet?.thumbnails?.medium?.url || v.snippet?.thumbnails?.default?.url || ''
      const minutes = isoDurationToMinutes(v.contentDetails?.duration || 'PT0M')
      const views = Number(v.statistics?.viewCount || 0)
      return {
        id: videoId,
        title,
        description,
        youtube_id: videoId,
        youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail_url: thumb,
        category,
        difficulty_level: 'beginner',
        duration_minutes: minutes,
        target_muscle_groups: [],
        equipment_needed: ['none'],
        tags: [],
        recovery_benefits: [],
        is_featured: false,
        view_count: views
      }
    })
    res.json({ items })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})
