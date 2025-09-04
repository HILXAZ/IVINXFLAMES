import React, { useRef, useEffect, useState } from 'react'
import { Mic, MicOff, Volume2, VolumeX, RotateCcw } from 'lucide-react'

// Simple Avatar Component (no Three.js dependencies)
function SimpleAvatar({ isListening, isSpeaking, currentViseme }) {
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

// Main Avatar Mentor Component (simplified without Three.js)
const AvatarMentor = () => {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentViseme, setCurrentViseme] = useState(0)
  const [emotion, setEmotion] = useState('neutral')
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I\'m your AI recovery mentor. How can I support you today?' }
  ])
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  
  const recognitionRef = useRef(null)
  const synthRef = useRef(null)

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setError('')
      }

      recognitionRef.current.onresult = (event) => {
        const text = event.results[0][0].transcript
        setInput(text)
        handleSendMessage(text)
      }

      recognitionRef.current.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
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
    setMessages(prev => [...prev, userMessage])
    setInput('')

    try {
      // Call your existing chat API
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [userMessage],
          temperature: 0.7
        })
      })

      if (response.ok) {
        const data = await response.json()
        const aiResponse = data.choices?.[0]?.message?.content || 'I understand. How else can I help?'
        const aiMessage = { role: 'assistant', text: aiResponse }
        setMessages(prev => [...prev, aiMessage])
        
        // Speak the response
        if (!isMuted) {
          speakResponse(aiResponse)
        }
      } else {
        setError('Failed to get response from AI mentor')
      }
    } catch (err) {
      setError('Failed to get response from AI mentor')
    }
  }

  const speakResponse = (text) => {
    if (!synthRef.current) return

    setIsSpeaking(true)
    setEmotion('happy')

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1.1
    utterance.volume = 1

    utterance.onend = () => {
      setIsSpeaking(false)
      setEmotion('neutral')
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
      setEmotion('neutral')
    }

    synthRef.current.speak(utterance)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  const resetConversation = () => {
    setMessages([
      { role: 'assistant', text: 'Hello! I\'m your AI recovery mentor. How can I support you today?' }
    ])
    setInput('')
    setError('')
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">3D Avatar Mentor</h1>
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
      <div className="flex-1 flex">
        {/* Avatar Area */}
        <div className="w-1/2 bg-gradient-to-b from-blue-50 to-white relative">
          <SimpleAvatar 
            isListening={isListening}
            isSpeaking={isSpeaking}
            currentViseme={currentViseme}
          />
          
          {/* Status indicators */}
          <div className="absolute top-4 left-4 space-y-2">
            {isListening && (
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Listening...</span>
              </div>
            )}
            {isSpeaking && (
              <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Speaking...</span>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-1/2 bg-white flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Error display */}
          {error && (
            <div className="mx-4 mb-2 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
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
                'Voice input not supported in this browser'}
              {!('speechSynthesis' in window) && 
                ' • Voice output not supported in this browser'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AvatarMentor

  const resetConversation = () => {
    setMessages([
      { role: 'assistant', text: 'Hello! I\'m your AI recovery mentor. How can I support you today?' }
    ])
    setInput('')
    setError('')
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">3D Avatar Mentor</h1>
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
      <div className="flex-1 flex">
        {/* Avatar Area */}
        <div className="w-1/2 bg-gradient-to-b from-blue-50 to-white relative">
          <SimpleAvatar 
            isListening={isListening}
            isSpeaking={isSpeaking}
            currentViseme={currentViseme}
          />
          
          {/* Status indicators */}
          <div className="absolute top-4 left-4 space-y-2">
            {isListening && (
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Listening...</span>
              </div>
            )}
            {isSpeaking && (
              <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Speaking...</span>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-1/2 bg-white flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Error display */}
          {error && (
            <div className="mx-4 mb-2 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
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
                'Voice input not supported in this browser'}
              {!('speechSynthesis' in window) && 
                ' • Voice output not supported in this browser'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AvatarMentor

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">3D AI Mentor</h1>
          <p className="text-gray-600">Your personal recovery companion with facial expressions</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 3D Avatar Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-96 bg-gradient-to-b from-blue-100 to-white">
                <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
                  <ambientLight intensity={0.6} />
                  <pointLight position={[10, 10, 10]} intensity={0.8} />
                  <pointLight position={[-10, -10, -10]} intensity={0.3} />
                  
                  <Suspense fallback={
                    <FallbackAvatar 
                      isListening={isListening} 
                      isSpeaking={isSpeaking} 
                    />
                  }>
                    <Avatar
                      avatarUrl={AVATAR_URLS[currentAvatar]}
                      isListening={isListening}
                      isSpeaking={isSpeaking}
                      currentViseme={currentViseme}
                      emotion={emotion}
                    />
                  </Suspense>
                  
                  <OrbitControls 
                    enablePan={false} 
                    enableZoom={false}
                    maxPolarAngle={Math.PI / 2}
                    minPolarAngle={Math.PI / 3}
                  />
                  <Environment preset="studio" />
                </Canvas>
              </div>
              
              {/* Avatar Controls */}
              <div className="p-4 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={startListening}
                      disabled={isListening || isSpeaking}
                      className={`p-3 rounded-full transition-all ${
                        isListening 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } disabled:opacity-50`}
                    >
                      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    
                    <button
                      onClick={toggleMute}
                      className={`p-3 rounded-full ${
                        isMuted ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                      } text-white transition-colors`}
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      ReadyPlayerMe Avatar Loaded
                    </div>
                  </div>
                </div>
                
                {/* Status Indicators */}
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <div className={`flex items-center gap-2 ${isListening ? 'text-red-600' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    {isListening ? 'Listening...' : 'Ready to listen'}
                  </div>
                  
                  <div className={`flex items-center gap-2 ${isSpeaking ? 'text-blue-600' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    {isSpeaking ? 'Speaking...' : 'Ready to speak'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Messages */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Conversation</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-50 border-blue-200 border ml-4'
                        : 'bg-gray-50 border-gray-200 border mr-4'
                    }`}
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      {message.role === 'user' ? 'You' : 'AI Mentor'}
                    </div>
                    <div className="text-sm text-gray-800">{message.text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Text Input */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Type Message</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(input)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => handleSendMessage(input)}
                  disabled={!input.trim() || isSpeaking}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Features Info */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>3D Avatar with facial expressions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Lip-sync animation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Voice recognition & synthesis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Recovery-focused conversations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AvatarMentor
