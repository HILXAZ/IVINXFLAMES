import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, MessageSquare, X, Heart } from 'lucide-react';
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
  const [speechSupported, setSpeechSupported] = useState(false);

  const recognitionRef = useRef(null);
  const avatarRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    // Check browser support
    const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setSpeechSupported(isSupported);
    
    if (isSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        setTranscript('');
      };

      recognitionRef.current.onresult = (event) => {
        console.log('Speech recognition result received:', event);
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          console.log(`Result ${i}: "${transcript}" (final: ${event.results[i].isFinal})`);
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Show interim results while speaking
        if (interimTranscript) {
          console.log('Interim transcript:', interimTranscript);
          setTranscript(interimTranscript);
        }

        // Process final results
        if (finalTranscript) {
          console.log('Final transcript:', finalTranscript);
          setTranscript(finalTranscript);
          handleVoiceCommand(finalTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error, event);
        setIsListening(false);
        
        // Show user-friendly error message
        if (event.error === 'no-speech') {
          setTranscript('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
          setTranscript('Microphone access denied. Please allow microphone access.');
        } else {
          setTranscript(`Speech recognition error: ${event.error}`);
        }
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
      setTranscript('Speech recognition not supported in this browser. Please use Chrome or Edge.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleVoiceCommand = async (command) => {
    console.log('🎯 Handling voice command:', command);
    setIsThinking(true);
    
    try {
      console.log('📤 Sending to AI:', command);
      const smartResponse = await generateSmartResponse(command, 'addiction_recovery');
      console.log('📥 AI Response:', smartResponse);
      setResponse(smartResponse);
      
      if (voiceEnabled) {
        console.log('🔊 Speaking response...');
        speak(smartResponse);
      }
    } catch (error) {
      console.error('❌ Error generating response:', error);
      const fallbackResponse = getMotivationalQuote();
      console.log('🔄 Using fallback:', fallbackResponse);
      setResponse(fallbackResponse);
      
      if (voiceEnabled) {
        speak(fallbackResponse);
      }
    }
    
    setIsThinking(false);
  };

  const speak = (text) => {
    console.log('🔊 Attempting to speak:', text);
    
    if (!speechSynthesis) {
      console.error('❌ Speech synthesis not available');
      return;
    }

    try {
      speechSynthesis.cancel(); // Cancel any previous speech
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;

      utterance.onstart = () => {
        console.log('✅ Speech started');
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        console.log('✅ Speech ended');
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        console.error('❌ Speech error:', event.error);
        setIsSpeaking(false);
      };

      console.log('📢 Starting speech synthesis...');
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('❌ Speech synthesis error:', error);
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    if (!speechSupported) {
      setTranscript('Speech recognition not supported in this browser.');
      return;
    }
    
    if (recognitionRef.current && !isListening) {
      try {
        console.log('Starting speech recognition...');
        setTranscript('Listening... (speak now)');
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setTranscript('Error starting microphone. Please try again.');
      }
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
                    {!speechSupported ? 'Speech not supported' :
                     isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : isThinking ? 'Thinking...' : 'Ready to help'}
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
                  !speechSupported 
                    ? 'bg-gray-400 cursor-not-allowed text-white' :
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
                disabled={isSpeaking || !speechSupported}
                title={!speechSupported ? 'Speech recognition not supported' : isListening ? 'Stop listening' : 'Start listening'}
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
              <div className={`p-3 rounded-lg ${speechSupported ? 'bg-yellow-50' : 'bg-red-50'}`}>
                <p className={`text-xs ${speechSupported ? 'text-yellow-800' : 'text-red-800'}`}>
                  {speechSupported 
                    ? '💡 Try saying: "I have a craving", "I need motivation", "Help me exercise", or "Hello"'
                    : '⚠️ Speech recognition requires Chrome, Edge, or Safari. Please use a supported browser.'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceAssistant;
