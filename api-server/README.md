# Advanced AI Recovery Coach API

A powerful, streaming AI backend for addiction recovery support using Google's Gemini AI.

## Features

- 🤖 **Streaming AI Responses**: Real-time, word-by-word responses for natural conversation
- 🎤 **Voice Analysis**: Advanced voice input processing with emotional context
- 🆘 **Crisis Support**: Immediate crisis intervention with professional resources
- 🔒 **Security**: Rate limiting, CORS protection, and input validation
- ⚡ **Performance**: Optimized for low latency and high throughput

## Quick Start

1. **Install dependencies**:
   ```bash
   cd api-server
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

3. **Get Gemini API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file

4. **Start the server**:
   ```bash
   npm run dev  # Development with auto-reload
   npm start    # Production
   ```

## API Endpoints

### `POST /api/coach/chat`
Advanced streaming chat with recovery coach AI.

**Request**:
```json
{
  "messages": [
    { "role": "user", "content": "I'm struggling with cravings today" }
  ],
  "stream": true,
  "temperature": 0.7
}
```

**Streaming Response** (Server-Sent Events):
```
data: {"type": "chunk", "content": "I understand", "fullContent": "I understand"}

data: {"type": "chunk", "content": " that cravings", "fullContent": "I understand that cravings"}

data: {"type": "complete", "content": "I understand that cravings can be overwhelming..."}
```

### `POST /api/coach/analyze-voice`
Analyze voice input for emotional context and provide targeted support.

### `POST /api/coach/crisis`
Immediate crisis support with professional resources and coping strategies.

### `GET /health`
Server health check and API status.

## Integration

The frontend automatically connects to this API. Make sure to:

1. Update your main app's `.env` to point to this server:
   ```
   VITE_API_BASE_URL=http://localhost:3001
   ```

2. The Vite dev server will proxy `/api/*` requests to this backend.

## Security Features

- Rate limiting (100 requests per 15 minutes per IP)
- CORS protection
- Input validation and sanitization
- Helmet security headers
- Environment-based configuration

## Development

- `npm run dev` - Auto-reload development server
- `npm start` - Production server
- Logs include request details and AI model usage

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure proper CORS origins
3. Use a process manager like PM2
4. Set up reverse proxy (nginx/Apache)
5. Enable HTTPS
