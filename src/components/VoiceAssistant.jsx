import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, MessageSquare, X, Settings, Heart } from 'lucide-react';
import { generateSmartResponse, getMotivationalQuote } from '../utils/geminiApi';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [position, setPosition] = useState({ x: window.innerWidth - 150, y: window.innerHeight - 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [showDailyMotivation, setShowDailyMotivation] = useState(false);
  const [dailyQuote, setDailyQuote] = useState('');
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const avatarRef = useRef(null);

  // Show daily motivation on first load
  useEffect(() => {
    const lastMotivationDate = localStorage.getItem('lastMotivationDate');
    const today = new Date().toDateString();
    
    if (lastMotivationDate !== today) {
      setDailyQuote(getMotivationalQuote());
      setShowDailyMotivation(true);
      localStorage.setItem('lastMotivationDate', today);
    }
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          handleVoiceCommand(finalTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Handle voice commands and generate responses
  const handleVoiceCommand = async (command) => {
    setIsThinking(true);
    
    try {
      // Use the enhanced AI response system
      const smartResponse = await generateSmartResponse(command, 'addiction_recovery');
      setResponse(smartResponse);
      
      if (voiceEnabled) {
        speak(smartResponse);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      // Fallback to motivational quote
      const fallbackResponse = getMotivationalQuote();
      setResponse(fallbackResponse);
      
      if (voiceEnabled) {
        speak(fallbackResponse);
      }
    }
    
    setIsThinking(false);
  };

  const speak = (text) => {
    if (speechSynthesis) {
      speechSynthesis.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      speechSynthesis.speak(utterance);
      speechSynthesisRef.current = utterance;
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Dragging functionality
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = avatarRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - 120, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 120, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <>
      {/* Avatar */}
      <motion.div
        ref={avatarRef}
        className={`fixed z-50 w-20 h-20 cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
        style={{ left: position.x, top: position.y }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ 
          scale: 1, 
          rotate: 0,
          y: isSpeaking ? [0, -5, 0] : 0
        }}
        transition={{ 
          type: "spring", 
          damping: 20,
          y: { repeat: isSpeaking ? Infinity : 0, duration: 0.6 }
        }}
        onMouseDown={handleMouseDown}
        onClick={() => setIsOpen(!isOpen)}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenuPosition({ x: e.clientX, y: e.clientY });
          setShowContextMenu(true);
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className={`w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center shadow-lg border-4 ${
          isListening ? 'border-red-400 animate-pulse' : 
          isSpeaking ? 'border-green-400' : 
          'border-white/30'
        }`}>
          <div className="text-2xl">
            {isThinking ? '🤔' : isSpeaking ? '🗣️' : isListening ? '👂' : '🧠'}
          </div>
        </div>
        
        {/* Status indicators */}
        {isListening && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <Mic className="w-3 h-3 text-white" />
          </div>
        )}
        
        {isSpeaking && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <Volume2 className="w-3 h-3 text-white" />
          </div>
        )}
      </motion.div>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed z-40 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20"
            style={{ 
              left: Math.min(position.x, window.innerWidth - 320), 
              top: Math.max(10, position.y - 350)
            }}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-sm">🧠</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Recovery Assistant</h3>
                  <p className="text-xs text-gray-500">
                    {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : isThinking ? 'Thinking...' : 'Ready to help'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Chat Content */}
            <div className="p-4 space-y-4 max-h-60 overflow-y-auto">
              {transcript && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">You said: "{transcript}"</p>
                </div>
              )}
              
              {response && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-800">{response}</p>
                </div>
              )}

              {!transcript && !response && (
                <div className="text-center text-gray-500 py-4">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click the microphone to start talking</p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-center gap-3">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`p-3 rounded-full transition-all ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
                disabled={isSpeaking}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-3 rounded-full transition-all ${
                  voiceEnabled 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-gray-400 hover:bg-gray-500 text-white'
                }`}
              >
                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Tips */}
            <div className="px-4 pb-4">
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-xs text-yellow-800">
                  💡 Try saying: "I have a craving", "I need motivation", "Help me exercise", or "Hello"
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {showContextMenu && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowContextMenu(false)}
            />
            <motion.div
              className="fixed z-50 bg-white/90 backdrop-blur-xl rounded-lg shadow-lg border border-white/20 py-2 min-w-48"
              style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <button
                onClick={() => {
                  setDailyQuote(getMotivationalQuote());
                  setShowDailyMotivation(true);
                  setShowContextMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <Heart className="w-4 h-4" />
                Daily Motivation
              </button>
              <button
                onClick={() => {
                  if (!isListening) startListening();
                  setShowContextMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-green-50 transition-colors flex items-center gap-2"
              >
                <Mic className="w-4 h-4" />
                Quick Talk
              </button>
              <button
                onClick={() => {
                  setVoiceEnabled(!voiceEnabled);
                  setShowContextMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-yellow-50 transition-colors flex items-center gap-2"
              >
                {voiceEnabled ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {voiceEnabled ? 'Mute Voice' : 'Enable Voice'}
              </button>
              <hr className="my-1 border-gray-200" />
              <button
                onClick={() => {
                  setPosition({ x: window.innerWidth - 150, y: window.innerHeight - 150 });
                  setShowContextMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Reset Position
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Daily Motivation Modal */}
      <AnimatePresence>
        {showDailyMotivation && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md mx-4"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Daily Motivation</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">"{dailyQuote}"</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDailyMotivation(false);
                      if (voiceEnabled) {
                        speak(dailyQuote);
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    Read to Me
                  </button>
                  <button
                    onClick={() => setShowDailyMotivation(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceAssistant;
