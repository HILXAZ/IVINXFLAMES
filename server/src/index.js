import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mysql from 'mysql2/promise'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const app = express()
app.use(cors())
app.use(express.json())

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
})

const JWT_SECRET = process.env.JWT_SECRET || 'change_me'

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
}

// Note: Auth middleware not used for diary routes (public per request)

// Health
app.get('/api/v1/health', (_req, res) => res.json({ ok: true }))

// Signup: /api/v1/signup (POST)
app.post('/api/v1/signup', async (req, res) => {
  const { email, password, name } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })
  try {
    const hash = await bcrypt.hash(password, 10)
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [email, hash, name || null]
    )
    const id = result.insertId
    const token = signToken({ id, email })
    return res.status(201).json({ id, email, name: name || null, token })
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'email already exists' })
    console.error(e)
    return res.status(500).json({ error: 'server_error' })
  }
})

// Login/Validate: /api/v1/users (POST) => validate credentials
app.post('/api/v1/users', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })
  try {
    const [rows] = await pool.execute('SELECT id, email, password_hash, name FROM users WHERE email = ? LIMIT 1', [email])
    if (!rows.length) return res.status(401).json({ error: 'invalid_credentials' })
    const user = rows[0]
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' })
    const token = signToken({ id: user.id, email: user.email })
    return res.json({ id: user.id, email: user.email, name: user.name, token })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'server_error' })
  }
})

// Create a new diary entry: /api/v1/diary (POST)
app.post('/api/v1/diary', async (req, res) => {
  const { title, content, mood, user_id } = req.body || {}
  if (!title || !content || !user_id) return res.status(400).json({ error: 'user_id, title and content required' })
  try {
    const [result] = await pool.execute(
      'INSERT INTO diary_entries (user_id, title, content, mood) VALUES (?, ?, ?, ?)',
      [user_id, title, content, mood || null]
    )
    const id = result.insertId
    return res.status(201).json({ id, user_id, title, content, mood: mood || null })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'server_error' })
  }
})

// Get all diaries for a user: /api/v1/diary/:id (GET)
app.get('/api/v1/diary/:id', async (req, res) => {
  const userId = Number(req.params.id)
  try {
    const [rows] = await pool.execute(
      'SELECT id, title, content, mood, created_at, updated_at FROM diary_entries WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    )
    return res.json(rows)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'server_error' })
  }
})

// Get single diary for edit (by diaryID): /api/v1/diary/:id/:diaryID (GET)
app.get('/api/v1/diary/:id/:diaryID', async (req, res) => {
  const userId = Number(req.params.id)
  const diaryId = Number(req.params.diaryID)
  try {
    const [rows] = await pool.execute(
      'SELECT id, title, content, mood, created_at, updated_at FROM diary_entries WHERE user_id = ? AND id = ? LIMIT 1',
      [userId, diaryId]
    )
    if (!rows.length) return res.status(404).json({ error: 'not_found' })
    return res.json(rows[0])
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'server_error' })
  }
})

// Update diary entry: /api/v1/diary/:id (PUT) — expects { id, title, content, mood }
app.put('/api/v1/diary/:id', async (req, res) => {
  const userId = Number(req.params.id)
  const { id, title, content, mood } = req.body || {}
  if (!id || !title || !content) return res.status(400).json({ error: 'id, title and content required' })
  try {
    const [result] = await pool.execute(
      'UPDATE diary_entries SET title = ?, content = ?, mood = ? WHERE id = ? AND user_id = ? LIMIT 1',
      [title, content, mood || null, id, userId]
    )
    if (result.affectedRows === 0) return res.status(404).json({ error: 'not_found' })
    return res.json({ ok: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'server_error' })
  }
})

// Delete entry: /api/v1/diary/:id (DELETE) — expects { id }
app.delete('/api/v1/diary/:id', async (req, res) => {
  const userId = Number(req.params.id)
  const { id } = req.body || {}
  if (!id) return res.status(400).json({ error: 'id required' })
  try {
    const [result] = await pool.execute(
      'DELETE FROM diary_entries WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    )
    if (result.affectedRows === 0) return res.status(404).json({ error: 'not_found' })
    return res.json({ ok: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'server_error' })
  }
})

// Dino Game API endpoints
// Save dino game score: /api/v1/dino/score (POST)
app.post('/api/v1/dino/score', async (req, res) => {
  const { score, timestamp } = req.body || {}
  if (!score) return res.status(400).json({ error: 'score required' })
  
  try {
    const [result] = await pool.execute(
      'INSERT INTO dino_scores (score, timestamp) VALUES (?, ?)',
      [score, timestamp || new Date().toISOString()]
    )
    return res.status(201).json({ id: result.insertId, score, saved: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'server_error' })
  }
})

// Get dino game leaderboard: /api/v1/dino/leaderboard (GET)
app.get('/api/v1/dino/leaderboard', async (req, res) => {
  try {
    const [scores] = await pool.execute(
      'SELECT score, timestamp FROM dino_scores ORDER BY score DESC LIMIT 10'
    )
    const [highScoreResult] = await pool.execute(
      'SELECT MAX(score) as highScore FROM dino_scores'
    )
    
    return res.json({ 
      leaderboard: scores,
      highScore: highScoreResult[0]?.highScore || 0,
      totalGames: scores.length
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'server_error' })
  }
})

// Get dino game stats: /api/v1/dino/stats (GET)
app.get('/api/v1/dino/stats', async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as totalGames,
        MAX(score) as highScore,
        AVG(score) as averageScore,
        MIN(score) as lowestScore
      FROM dino_scores
    `)
    
    return res.json(stats[0] || { totalGames: 0, highScore: 0, averageScore: 0, lowestScore: 0 })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'server_error' })
  }
})

const port = Number(process.env.PORT || 5050)
app.listen(port, () => {
  console.log(`diary api listening on :${port}`)
})
