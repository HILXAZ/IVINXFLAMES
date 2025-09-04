import React, { useState, useRef, useEffect } from 'react';

const VoiceTest = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [browserSupport, setBrowserSupport] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check browser support
    const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setBrowserSupport(isSupported);
    
    if (isSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Configuration
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      // Event handlers
      recognitionRef.current.onstart = () => {
        console.log('✅ Speech recognition started');
        setIsListening(true);
        setError('');
        setTranscript('Listening... speak now!');
      };

      recognitionRef.current.onresult = (event) => {
        console.log('📝 Speech result:', event);
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          console.log(`Result ${i}: "${transcript}" (final: ${event.results[i].isFinal})`);
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Update display
        if (finalTranscript) {
          setTranscript(`FINAL: ${finalTranscript}`);
          console.log('✅ Final transcript:', finalTranscript);
        } else if (interimTranscript) {
          setTranscript(`INTERIM: ${interimTranscript}`);
          console.log('🔄 Interim transcript:', interimTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        console.log('⏹️ Speech recognition ended');
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);
        setError(`Error: ${event.error}`);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone access and try again.');
        } else if (event.error === 'no-speech') {
          setError('No speech was detected. Please try speaking again.');
        } else if (event.error === 'network') {
          setError('Network error. Please check your internet connection.');
        }
      };
    } else {
      setError('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (!browserSupport) {
      setError('Speech recognition not supported');
      return;
    }

    try {
      console.log('🎤 Starting speech recognition...');
      setError('');
      recognitionRef.current.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      setError('Failed to start speech recognition');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      console.log('🛑 Stopping speech recognition...');
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white p-4 rounded-lg shadow-lg border max-w-md">
      <h3 className="font-bold mb-2 text-green-600">🎤 Voice Assistant Debug Panel</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Browser Support:</strong> {browserSupport ? '✅ Yes' : '❌ No'}
        </div>
        
        <div>
          <strong>Status:</strong> {isListening ? '🎤 Listening' : '⏸️ Stopped'}
        </div>
        
        <div>
          <strong>Speech Synthesis:</strong> {'speechSynthesis' in window ? '✅ Available' : '❌ Not Available'}
        </div>
        
        <div>
          <strong>Transcript:</strong>
          <div className="bg-gray-100 p-2 rounded text-xs mt-1 min-h-[60px] max-h-[100px] overflow-y-auto">
            {transcript || 'No speech detected yet...'}
          </div>
        </div>
        
        {error && (
          <div className="text-red-600 text-xs bg-red-50 p-2 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={startListening}
            disabled={isListening || !browserSupport}
            className="px-2 py-1 bg-green-500 text-white rounded disabled:bg-gray-400 text-xs"
          >
            🎤 Start
          </button>
          <button
            onClick={stopListening}
            disabled={!isListening}
            className="px-2 py-1 bg-red-500 text-white rounded disabled:bg-gray-400 text-xs"
          >
            ⏹️ Stop
          </button>
          <button
            onClick={() => {
              const testText = "This is a test of speech synthesis.";
              console.log('Testing speech synthesis...');
              if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(testText);
                speechSynthesis.speak(utterance);
              }
            }}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
          >
            🔊 Test TTS
          </button>
        </div>
        
        <div className="text-xs text-gray-500 pt-2 border-t">
          💡 Check browser console (F12) for detailed logs
        </div>
      </div>
    </div>
  );
};

export default VoiceTest;
