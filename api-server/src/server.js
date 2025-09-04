import { GoogleGenerativeAI } from '@google/generative-ai'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { RateLimiterMemory } from 'rate-limiter-flexible'
import 'dotenv/config'

const app = express()
const port = process.env.PORT || 3001

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
})

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip)
    next()
  } catch (rejRes) {
    res.status(429).json({
      error: 'Too many requests',
      resetTime: new Date(Date.now() + rejRes.msBeforeNext)
    })
  }
})

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Advanced system prompt for addiction recovery coaching
const SYSTEM_PROMPT = `You are an expert addiction recovery coach and mental health supporter. Your role is to:

1. Provide compassionate, evidence-based support for addiction recovery
2. Offer practical coping strategies and techniques
3. Help users process emotions and challenges
4. Guide users toward professional resources when needed
5. Maintain a supportive but professional tone

Guidelines:
- Always be empathetic and non-judgmental
- Focus on harm reduction and recovery-oriented approaches
- Encourage professional help for serious issues
- Provide actionable advice and coping strategies
- Be concise but thorough in your responses
- If asked about medical advice, redirect to healthcare professionals

Remember: You're here to support, not replace professional treatment.`

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    geminiConnected: !!process.env.GEMINI_API_KEY
  })
})

// Advanced streaming chat endpoint
app.post('/api/coach/chat', async (req, res) => {
  try {
    const { messages, temperature, maxTokens, stream = true } = req.body

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key not configured',
        setup: 'Add GEMINI_API_KEY to your .env file'
      })
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'Messages array is required and must not be empty'
      })
    }

    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      generationConfig: {
        temperature: temperature || parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7,
        maxOutputTokens: maxTokens || parseInt(process.env.GEMINI_MAX_TOKENS) || 2048,
      }
    })

    // Format messages for Gemini
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content || msg.text || '' }]
    }))

    // Add system prompt as first message
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: 'I understand. I\'m here to provide compassionate, evidence-based support for your recovery journey. How can I help you today?' }] },
        ...formattedMessages.slice(0, -1) // All but the last message
      ]
    })

    const lastMessage = formattedMessages[formattedMessages.length - 1]

    if (stream) {
      // Set up Server-Sent Events for streaming
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:5173',
        'Access-Control-Allow-Credentials': 'true'
      })

      try {
        const result = await chat.sendMessageStream(lastMessage.parts[0].text)
        
        let fullText = ''
        for await (const chunk of result.stream) {
          const chunkText = chunk.text()
          fullText += chunkText
          
          // Send chunk as SSE
          res.write(`data: ${JSON.stringify({ 
            type: 'chunk', 
            content: chunkText,
            fullContent: fullText 
          })}\n\n`)
        }

        // Send completion signal
        res.write(`data: ${JSON.stringify({ 
          type: 'complete', 
          content: fullText 
        })}\n\n`)
        
      } catch (streamError) {
        console.error('Streaming error:', streamError)
        res.write(`data: ${JSON.stringify({ 
          type: 'error', 
          error: 'AI service temporarily unavailable' 
        })}\n\n`)
      }

      res.end()
    } else {
      // Non-streaming response (OpenAI-compatible format)
      const result = await chat.sendMessage(lastMessage.parts[0].text)
      const response = await result.response
      const text = response.text()

      res.json({
        choices: [{
          message: {
            role: 'assistant',
            content: text
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: formattedMessages.reduce((acc, msg) => acc + msg.parts[0].text.length, 0),
          completion_tokens: text.length,
          total_tokens: formattedMessages.reduce((acc, msg) => acc + msg.parts[0].text.length, 0) + text.length
        }
      })
    }

  } catch (error) {
    console.error('Chat API error:', error)
    res.status(500).json({
      error: 'Failed to generate response',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Enhanced voice analysis endpoint
app.post('/api/coach/analyze-voice', async (req, res) => {
  try {
    const { transcript, emotion, confidence } = req.body

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' })
    }

    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' 
    })

    const analysisPrompt = `
    Analyze this voice transcript for emotional state and provide recovery support:
    
    Transcript: "${transcript}"
    ${emotion ? `Detected emotion: ${emotion}` : ''}
    ${confidence ? `Confidence: ${confidence}` : ''}
    
    Provide:
    1. Emotional assessment (1-2 sentences)
    2. Immediate support suggestion (1-2 sentences)
    3. Coping strategy recommendation (1-2 sentences)
    
    Keep response concise and supportive.`

    const result = await model.generateContent(analysisPrompt)
    const response = await result.response
    const analysis = response.text()

    res.json({
      transcript,
      analysis,
      suggestions: analysis.split('\n').filter(line => line.trim()),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Voice analysis error:', error)
    res.status(500).json({
      error: 'Failed to analyze voice input',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Crisis support endpoint with immediate resources
app.post('/api/coach/crisis', async (req, res) => {
  try {
    const { message, urgencyLevel = 'medium' } = req.body

    const crisisResources = {
      immediate: [
        { name: 'National Suicide Prevention Lifeline', number: '988', available: '24/7' },
        { name: 'Crisis Text Line', number: 'Text HOME to 741741', available: '24/7' },
        { name: 'SAMHSA National Helpline', number: '1-800-662-4357', available: '24/7' }
      ],
      coping: [
        'Take 5 deep breaths - inhale for 4, hold for 4, exhale for 6',
        'Ground yourself: name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste',
        'Call a trusted friend or family member',
        'Go to your nearest emergency room if you feel unsafe'
      ]
    }

    if (urgencyLevel === 'high') {
      return res.json({
        priority: 'IMMEDIATE_HELP_NEEDED',
        message: 'Please reach out for immediate professional help',
        resources: crisisResources.immediate,
        coping: crisisResources.coping.slice(0, 2)
      })
    }

    // Generate contextual support
    if (process.env.GEMINI_API_KEY && message) {
      const model = genAI.getGenerativeModel({ 
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' 
      })

      const crisisPrompt = `
      Provide immediate, compassionate crisis support for this message:
      "${message}"
      
      Respond with:
      1. Immediate validation and support (2-3 sentences)
      2. One specific grounding technique
      3. Encouragement to seek professional help if needed
      
      Be warm, direct, and supportive. This person needs immediate care.`

      const result = await model.generateContent(crisisPrompt)
      const response = await result.response
      const support = response.text()

      res.json({
        priority: urgencyLevel,
        support,
        resources: crisisResources.immediate,
        coping: crisisResources.coping,
        followUp: 'Consider reaching out to a counselor or trusted person for ongoing support'
      })
    } else {
      res.json({
        priority: urgencyLevel,
        support: 'You\'re not alone. Crisis moments are temporary, and support is available.',
        resources: crisisResources.immediate,
        coping: crisisResources.coping
      })
    }

  } catch (error) {
    console.error('Crisis support error:', error)
    // Always provide basic crisis resources even if AI fails
    res.json({
      priority: 'high',
      support: 'I\'m having trouble connecting right now, but help is still available.',
      resources: [
        { name: 'National Suicide Prevention Lifeline', number: '988', available: '24/7' },
        { name: 'Crisis Text Line', number: 'Text HOME to 741741', available: '24/7' }
      ],
      coping: ['Take deep breaths', 'You are not alone', 'This feeling will pass']
    })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'POST /api/coach/chat',
      'POST /api/coach/analyze-voice',
      'POST /api/coach/crisis'
    ]
  })
})

app.listen(port, () => {
  console.log(`🚀 Advanced AI Recovery Coach API running on port ${port}`)
  console.log(`🔑 Gemini API: ${process.env.GEMINI_API_KEY ? 'Connected' : 'Not configured'}`)
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`)
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`)
})
