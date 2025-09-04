import React, { useRef, useEffect, useState } from 'react'
import { Mic, MicOff, Volume2, VolumeX, RotateCcw } from 'lucide-react'

// Simple Avatar Component (no Three.js dependencies)
function SimpleAvatar({ isListening, isSpeaking }) {
  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-b from-blue-100 to-white">
      <div className="text-center">
        <div 
          className={`w-32 h-32 mx-auto rounded-full mb-4 transition-all duration-300 ${
            isSpeaking ? 'bg-blue-500 scale-110' : 
            isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          } flex items-center justify-center text-white text-4xl`}
        >
          🤖
        </div>
        <h3 className="text-lg font-semibold text-gray-700">AI Mentor</h3>
        <p className="text-sm text-gray-500 mt-2">
          {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Ready to help'}
        </p>
        <div className="mt-4 text-xs text-blue-600">
          Voice-enabled AI mentor interface
        </div>
      </div>
    </div>
  )
}

// Main Voice Mentor Component
const VoiceMentor = () => {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I\'m your AI recovery mentor. How can I support you today?' }
  ])
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  
  const recognitionRef = useRef(null)
  const synthRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Initialize speech recognition & synthesis
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onstart = () => setIsListening(true)
      recognitionRef.current.onresult = (event) => {
        const text = event.results[0][0].transcript
        setInput(text)
        handleSendMessage(text)
      }
      recognitionRef.current.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }
      recognitionRef.current.onend = () => setIsListening(false)
    }

    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setError('')
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const handleSendMessage = async (text) => {
    if (!text.trim()) return

    const userMessage = { role: 'user', text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')

    try {
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.slice(-10), // Send last 10 messages for context
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`)
      }

      const data = await response.json()
      const aiResponse = data.choices?.[0]?.message?.content || 'I understand. How else can I help?'
      const aiMessage = { role: 'assistant', text: aiResponse }
      setMessages(prev => [...prev, aiMessage])
      
      if (!isMuted) {
        speakResponse(aiResponse)
      }
    } catch (err) {
      setError(`Failed to get response: ${err.message}`)
      const errorMessage = { role: 'assistant', text: `Sorry, I encountered an error. ${err.message}` }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const speakResponse = (text) => {
    if (!synthRef.current || isMuted) return

    synthRef.current.cancel() // Cancel any previous speech
    setIsSpeaking(true)

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => {
      setIsSpeaking(false)
      setError("Sorry, an error occurred during speech synthesis.")
    }

    synthRef.current.speak(utterance)
  }

  const toggleMute = () => {
    setIsMuted(prev => {
      if (!prev) { // if unmuting
        synthRef.current?.cancel()
        setIsSpeaking(false)
      }
      return !prev
    })
  }

  const resetConversation = () => {
    synthRef.current?.cancel()
    setIsSpeaking(false)
    setIsListening(false)
    setMessages([
      { role: 'assistant', text: 'Hello! I\'m your AI recovery mentor. How can I support you today?' }
    ])
    setInput('')
    setError('')
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">AI Mentor</h1>
              <p className="text-sm text-gray-500">Your personal recovery companion</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className={`p-2 rounded-lg transition-colors ${
                isMuted ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            
            <button
              onClick={resetConversation}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="Reset Conversation"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row" style={{minHeight: 0}}>
        {/* Avatar Area */}
        <div className="w-full md:w-1/2 bg-gradient-to-b from-blue-50 to-white relative flex-shrink-0">
          <SimpleAvatar 
            isListening={isListening}
            isSpeaking={isSpeaking}
          />
          
          <div className="absolute top-4 left-4 space-y-2">
            {isListening && (
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2 shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Listening...</span>
              </div>
            )}
            {isSpeaking && (
              <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2 shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-ping absolute"></div>
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Speaking...</span>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-full md:w-1/2 bg-white flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-md ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="mx-4 mb-2 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(input)}
                placeholder="Type your message or use voice..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isListening || isSpeaking}
              />
              
              <button
                onClick={() => handleSendMessage(input)}
                disabled={!input.trim() || isListening || isSpeaking}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
              
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isSpeaking}
                className={`p-2 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isListening ? 'Stop Listening' : 'Start Voice Input'}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            </div>
            
            <div className="mt-2 text-xs text-gray-500 text-center">
              {!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && 
                'Voice input not supported in this browser.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoiceMentor
