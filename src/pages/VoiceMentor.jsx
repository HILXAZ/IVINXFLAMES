import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Volume2, Play, Pause, AlertCircle } from 'lucide-react'
import { useToast } from '../components/Toast'
import OppenheimerBackground from '../components/OppenheimerBackground'
import assemblyAI from '../services/assemblyai'

export default function VoiceMentor() {
  const { push } = useToast()
  const [status, setStatus] = useState('idle') // idle | connecting | live | stopped | error
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [partialTranscript, setPartialTranscript] = useState('')
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')
  const [voiceSupported, setVoiceSupported] = useState(false)
  
  const ASSEMBLY_API_KEY = import.meta.env.VITE_ASSEMBLY_API_KEY

  // Recovery-focused responses for AI mentor
  const recoveryResponses = [
    "I'm here to support you on your recovery journey. You're taking a brave step by reaching out.",
    "Recovery is a process, and every day you choose health is a victory. How can I help you today?",
    "Remember, setbacks don't define you. Your commitment to getting back up does. You're stronger than you know.",
    "Let's focus on this moment. Take a deep breath with me and remember that you have the power to overcome any challenge.",
    "Your recovery matters, and so do you. What strategies have been helping you stay on track lately?",
    "It's okay to feel overwhelmed sometimes. That's part of being human. Let's talk through what you're experiencing.",
    "Every conversation we have is an investment in your well-being. I'm proud of you for being here."
  ]

  // Initialize voice service with enhanced error handling
  useEffect(() => {
    const initializeVoiceService = async () => {
      try {
        if (!ASSEMBLY_API_KEY) {
          setError('AssemblyAI API key is missing. Please check your environment configuration.')
          return
        }

        // Check browser compatibility
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError('Your browser does not support microphone access. Please use Chrome, Firefox, or Edge.')
          setVoiceSupported(false)
          return
        }

        if (!window.WebSocket) {
          setError('Your browser does not support real-time voice features. Please use a modern browser.')
          setVoiceSupported(false)
          return
        }

        if (!window.speechSynthesis) {
          push('Voice output not supported in this browser. You will only see text responses.', 'warning')
        }
        
        await assemblyAI.initialize()
        setVoiceSupported(true)
        setError('')
        push('Voice mentor is ready! Click the microphone to start talking.', 'success')
      } catch (err) {
        setError(err.message)
        setVoiceSupported(false)
        push('Voice features unavailable: ' + err.message, 'error')
      }
    }

    initializeVoiceService()
    
    return () => {
      if (assemblyAI.getIsListening()) {
        assemblyAI.stopRealTimeTranscription()
      }
    }
  }, [ASSEMBLY_API_KEY, push])

  // Handle AssemblyAI transcription events
  useEffect(() => {
    if (!ASSEMBLY_API_KEY) {
      push('AssemblyAI setup required. Please add VITE_ASSEMBLY_API_KEY to your environment.', 'info')
      return
    }

    const initializeAssemblyAI = async () => {
      try {
        await assemblyAI.initialize()
        setVoiceSupported(true)
        setStatus('ready')
        
        // Set up event handlers
        assemblyAI.onTranscript((transcript) => {
          console.log('Final transcript:', transcript)
          setMessages(prev => [...prev, { 
            role: 'user', 
            text: transcript,
            timestamp: Date.now()
          }])
          setPartialTranscript('')
          
          // Generate AI response
          const randomResponse = recoveryResponses[Math.floor(Math.random() * recoveryResponses.length)]
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              text: randomResponse,
              timestamp: Date.now()
            }])
          }, 1500)
        })

        assemblyAI.onPartialTranscript((partialText) => {
          setPartialTranscript(partialText)
        })

        assemblyAI.onError((error) => {
          console.error('AssemblyAI error:', error)
          setStatus('error')
          push('Voice error: ' + error.message, 'error')
        })

        push('Voice mentor ready! Click the microphone to start.', 'success')
        
      } catch (error) {
        console.error('Failed to initialize AssemblyAI:', error)
        setStatus('error')
        setVoiceSupported(false)
        push('Voice initialization failed: ' + error.message, 'error')
      }
    }

    initializeAssemblyAI()
    
    return () => {
      if (assemblyAI.getIsListening()) {
        assemblyAI.stopRealTimeTranscription()
      }
    }
  }, [ASSEMBLY_API_KEY, push])

  const start = useCallback(async () => {
    if (!voiceSupported) {
      push('Voice features are not available. Please check your microphone permissions.', 'error')
      return
    }

    if (!ASSEMBLY_API_KEY) {
      push('AssemblyAI API key is required. Please add VITE_ASSEMBLY_API_KEY to your environment.', 'error')
      console.log(`
🎙️ ASSEMBLYAI SETUP INSTRUCTIONS:
1. Sign up at https://www.assemblyai.com
2. Get your API key from dashboard
3. Add to your .env file:
   VITE_ASSEMBLY_API_KEY=your_api_key_here
4. Restart the development server
      `)
      return
    }

    try {
      setStatus('connecting')
      setMessages([])
      setTranscript('')
      setPartialTranscript('')

      // Define callback functions for transcription
      const handleTranscript = (text, isFinal) => {
        if (isFinal) {
          console.log('Final transcript:', text)
          setMessages(prev => [...prev, { 
            role: 'user', 
            text: text,
            timestamp: Date.now()
          }])
          setPartialTranscript('')
          
          // Generate AI response
          const randomResponse = recoveryResponses[Math.floor(Math.random() * recoveryResponses.length)]
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              text: randomResponse,
              timestamp: Date.now()
            }])
            
            // Speak the response using Web Speech API with enhanced voice selection
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(randomResponse)
              
              // Enhanced voice settings
              utterance.rate = 0.85
              utterance.pitch = 1.1
              utterance.volume = 0.9
              
              // Try to select a pleasant female voice
              const voices = window.speechSynthesis.getVoices()
              const preferredVoice = voices.find(voice => 
                voice.name.includes('Female') || 
                voice.name.includes('Samantha') || 
                voice.name.includes('Karen') ||
                voice.name.includes('Zira') ||
                voice.name.includes('Natural')
              ) || voices.find(voice => voice.lang.startsWith('en'))
              
              if (preferredVoice) {
                utterance.voice = preferredVoice
              }
              
              utterance.onstart = () => setIsSpeaking(true)
              utterance.onend = () => setIsSpeaking(false)
              utterance.onerror = (e) => {
                console.error('Speech synthesis error:', e)
                setIsSpeaking(false)
              }
              
              // Cancel any previous speech before starting new one
              window.speechSynthesis.cancel()
              window.speechSynthesis.speak(utterance)
            }
          }, 1500)
        } else {
          setPartialTranscript(text)
        }
      }

      const handleError = (error) => {
        console.error('AssemblyAI transcription error:', error)
        setStatus('error')
        setError(error)
        push('Voice error: ' + error, 'error')
      }

      await assemblyAI.startRealTimeTranscription(handleTranscript, handleError)
      setIsListening(true)
      setStatus('live')
      
      // Welcome message
      const welcomeMessage = "Hello! I'm your AI recovery mentor. I'm here to listen and support you on your journey. How are you feeling today?"
      setMessages([{ 
        role: 'assistant', 
        text: welcomeMessage,
        timestamp: Date.now()
      }])
      
      push('Voice conversation started. I\'m listening...', 'success')
      
    } catch (error) {
      console.error('Failed to start voice conversation:', error)
      setStatus('error')
      push('Failed to start voice conversation: ' + error.message, 'error')
    }
  }, [voiceSupported, ASSEMBLY_API_KEY, push])

  const stop = useCallback(async () => {
    try {
      await assemblyAI.stopRealTimeTranscription()
      setIsListening(false)
      setStatus('stopped')
      setPartialTranscript('')
      push('Voice conversation ended.', 'info')
    } catch (error) {
      console.error('Failed to stop voice conversation:', error)
      push('Error stopping conversation: ' + error.message, 'error')
    }
  }, [push])

  const toggleMute = useCallback(() => {
    // Note: AssemblyAI doesn't have built-in mute, so we'll stop/start transcription
    if (isListening) {
      stop()
    } else {
      start()
    }
  }, [isListening, start, stop])

  return (
    <OppenheimerBackground>
      <div className="relative z-10 max-w-4xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">AI Voice Mentor</h1>
          <div className="flex items-center space-x-2">
            {isListening && <span className="text-xs px-3 py-1.5 rounded-full bg-green-500/20 text-green-200 border border-green-400/30 animate-pulse">LISTENING</span>}
            {isSpeaking && <span className="text-xs px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 animate-pulse">SPEAKING</span>}
            <span className="text-xs px-3 py-1.5 rounded-full bg-white/20 text-white border border-white/30">{status}</span>
          </div>
        </div>

      {!voiceSupported ? (
        <div className="p-6 rounded-2xl border border-orange-400/30 bg-orange-500/10 backdrop-blur-xl">
          <h3 className="font-semibold text-orange-200 mb-3 text-lg">🎙️ Voice Feature Setup Required</h3>
          <p className="text-sm text-orange-100 mb-4 leading-relaxed">
            {!ASSEMBLY_API_KEY 
              ? "AssemblyAI API key is required for voice features. Please add VITE_ASSEMBLY_API_KEY to your environment."
              : "Voice features are not supported in this browser or microphone access was denied."
            }
          </p>
          <div className="flex gap-3 flex-wrap">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Reload Page
            </button>
            <button 
              onClick={() => navigator.mediaDevices.getUserMedia({ audio: true }).then(() => window.location.reload())} 
              className="px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Enable Microphone
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
          <button 
            onClick={isListening ? stop : start} 
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out shadow-2xl
              ${isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-green-500 hover:bg-green-600'}
              ${status === 'connecting' ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={status === 'connecting' || !voiceSupported}
          >
            {isListening ? (
              <MicOff size={48} className="text-white" />
            ) : (
              <Mic size={48} className="text-white" />
            )}
          </button>
        </div>
      )}

      {partialTranscript && (
        <div className="p-4 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 text-yellow-100 text-sm backdrop-blur-xl shadow-lg">
          <strong className="text-yellow-200">Listening...</strong> {partialTranscript}
        </div>
      )}

      <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-xl min-h-[300px] p-4">
        <div className="space-y-4 h-full overflow-y-auto">
          {messages.length === 0 && <div className="text-gray-300 italic text-center pt-10">No messages yet. Click the microphone to start the conversation.</div>}
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-lg px-4 py-3 rounded-2xl shadow-md ${msg.role === 'user' ? 'bg-blue-600/50 text-white' : 'bg-white/30 text-white'}`}>
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl border border-red-400/30 bg-red-500/10 text-red-100 text-sm backdrop-blur-xl shadow-lg">
          <strong className="text-red-200">Error:</strong> {error}
        </div>
      )}
    </div>
  </OppenheimerBackground>
  )
}
