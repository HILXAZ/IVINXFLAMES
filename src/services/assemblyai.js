// AssemblyAI JavaScript service for voice transcription
// Converts Python streaming functionality to browser-compatible JavaScript

class AssemblyAIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_ASSEMBLY_API_KEY;
    this.baseURL = 'https://api.assemblyai.com/v2';
    this.websocketURL = 'wss://api.assemblyai.com/v2/realtime/ws';
    this.socket = null;
    this.isListening = false;
    this.mediaRecorder = null;
    this.audioContext = null;
  }

  // Initialize the service
  async initialize() {
    if (!this.apiKey) {
      throw new Error('AssemblyAI API key not found. Please set VITE_ASSEMBLY_API_KEY in your environment variables.');
    }
    
    // Check if browser supports required APIs
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Browser does not support microphone access');
    }
    
    if (!window.WebSocket) {
      throw new Error('Browser does not support WebSocket connections');
    }

    return true;
  }

  // Start real-time transcription
  async startRealTimeTranscription(onTranscript, onError) {
    try {
      await this.initialize();
      
      // Get microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });

      // Create WebSocket connection
      const wsURL = `${this.websocketURL}?sample_rate=16000&token=${this.apiKey}`;
      this.socket = new WebSocket(wsURL);

      this.socket.onopen = () => {
        console.log('AssemblyAI WebSocket connected');
        this.isListening = true;
        this.setupAudioRecording(stream);
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.message_type === 'FinalTranscript') {
          onTranscript(data.text, true); // Final transcript
        } else if (data.message_type === 'PartialTranscript') {
          onTranscript(data.text, false); // Partial transcript
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError('Connection error occurred');
      };

      this.socket.onclose = () => {
        console.log('AssemblyAI WebSocket disconnected');
        this.isListening = false;
        this.cleanup();
      };

    } catch (error) {
      console.error('Failed to start real-time transcription:', error);
      onError(error.message);
    }
  }

  // Setup audio recording and streaming
  setupAudioRecording(stream) {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    const source = this.audioContext.createMediaStreamSource(stream);
    
    // Create a ScriptProcessor for audio data
    const processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (event) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        const inputData = event.inputBuffer.getChannelData(0);
        
        // Convert float32 to int16
        const int16Array = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          int16Array[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        // Send audio data to AssemblyAI
        this.socket.send(int16Array.buffer);
      }
    };

    source.connect(processor);
    processor.connect(this.audioContext.destination);
    
    // Store references for cleanup
    this.processor = processor;
    this.source = source;
    this.stream = stream;
  }

  // Stop real-time transcription
  stopRealTimeTranscription() {
    if (this.socket) {
      this.socket.close();
    }
    this.cleanup();
  }

  // Transcribe audio file (for uploaded files)
  async transcribeFile(audioFile) {
    try {
      // First, upload the audio file
      const uploadResponse = await this.uploadFile(audioFile);
      const audioURL = uploadResponse.upload_url;

      // Request transcription
      const transcriptionResponse = await fetch(`${this.baseURL}/transcript`, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audio_url: audioURL,
          speech_model: 'universal'
        })
      });

      const transcription = await transcriptionResponse.json();
      
      // Poll for completion
      return await this.pollTranscriptionStatus(transcription.id);
    } catch (error) {
      console.error('File transcription failed:', error);
      throw error;
    }
  }

  // Upload audio file to AssemblyAI
  async uploadFile(audioFile) {
    const formData = new FormData();
    formData.append('file', audioFile);

    const response = await fetch(`${this.baseURL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': this.apiKey
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload audio file');
    }

    return response.json();
  }

  // Poll transcription status until complete
  async pollTranscriptionStatus(transcriptionId) {
    while (true) {
      const response = await fetch(`${this.baseURL}/transcript/${transcriptionId}`, {
        headers: {
          'Authorization': this.apiKey
        }
      });

      const transcription = await response.json();

      if (transcription.status === 'completed') {
        return transcription;
      } else if (transcription.status === 'error') {
        throw new Error(`Transcription failed: ${transcription.error}`);
      }

      // Wait 1 second before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Cleanup resources
  cleanup() {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    this.isListening = false;
  }

  // Check if currently listening
  getIsListening() {
    return this.isListening;
  }
}

export default new AssemblyAIService();
