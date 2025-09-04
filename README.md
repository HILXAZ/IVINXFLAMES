# Real-Life AI Mentor — Project Brief

This repository contains a React + Vite app with Supabase and an Express API. The section below defines the next-level, production-grade AI Mentor we’re building.

---

## Master Copilot Prompt

Build a Real-Life AI Mentor with advanced live interaction:

GOALS

- Natural, hands-free conversation (no push-to-talk): low-latency, interruptible, empathetic.
- Tools: breathing coach, journaling, focus plan, break timer; mentor can trigger them contextually.
- Robust privacy/safety: crisis detection + de-escalation.

FRONTEND (React + Tailwind)

- WebRTC audio-only by default; optional avatar video (lip-sync).
- Voice UX:
  - VAD (voice activity detection) to auto start/stop capture.
  - Partial STT captions streaming in UI.
  - Barge-in (user can interrupt TTS; mentor stops speaking and listens).
- Streaming UI:
  - Token-by-token mentor captions; show typing/latency indicators.
  - Live stress meter (sentiment + acoustic features).
- Exercises:
  - Breathing animation synced to mentor count.
  - Journaling panel with prompts; autosave draft.
  - 5-minute focus sprint timer with start/pause and progress ring.
- Accessibility: keyboard shortcuts (m to mute, space to hold-to-talk), captions toggle, speech rate control.
- Offline fallback: text chat if mic permissions denied.

BACKEND (Node.js + Express)

- Realtime pipeline:
  - /ws for duplex audio & events (browser ↔ server).
  - Server frames -> STT (streaming) -> Dialogue Manager (GPT) -> TTS (streaming).
  - Emit events: stt.partial, stt.final, ai.token, ai.final, tts.chunk, tts.done, tool.start, tool.update, tool.done.
- Turn-taking:
  - VAD + no-silence timeout; cut TTS if user starts speaking (barge-in).
- Emotion:
  - Lightweight prosody analysis (pitch/energy) + sentiment, classify {calm, tense, sad, angry, overwhelmed}.
- Memory:
  - Short-term (session context window) + long-term (Supabase user_memory table for stable prefs/goals).
- Safety:
  - Crisis classifier (self-harm, abuse) → safe reply + helpline CTA; redact PII in logs via server-side filter.
- Tools (server-side “function calling” dispatcher):
  - breathing.start(duration, mode); journaling.prompt(topic); focus.start(minutes); break.start(minutes).
- Observability:
  - Structured logs (pino), request id, latency metrics, error tags; optional OpenTelemetry.

DATA (Supabase)

- Tables:
  - mentor_sessions(id, user_id, started_at, ended_at, stress_before, stress_after, summary, emotions[])
  - mentor_messages(id, session_id, role, content, sentiment, emotion, tokens, latency_ms, suggested_action, created_at)
  - mentor_stats(user_id, total_sessions, total_messages, avg_stress_delta, last_session_at)
  - mentor_notes(id, session_id, note, kind, created_at)
  - user_memory(user_id, preferences jsonb, goals jsonb, created_at, updated_at)
- RLS: users only access their rows.

PERFORMANCE TARGETS

- <300ms first partial caption, <1.2s first audio for mentor reply, <80ms WS jitter tolerance.
- Retry on packet loss; resume WS session tokens.

DELIVERABLES

- Frontend: React components (MentorRoom, VoiceTransport, CaptionsStream, StressMeter, ToolsDrawer).
- Backend: Express app + WS server, STT/TTS providers, Dialogue Manager with tool-calling, Supabase DAL.
- Scripts: .env examples, local mock providers, load test (k6/Artillery).


## ✨ Features

### 🔐 Authentication & Security

### 📊 Habit Tracking & Analytics

### 🤖 AI-Powered Motivation
New endpoints and pages added:
- Server: POST /api/coach/chat (uses GEMINI_API_KEY server-side)
- Pages: /coach (Gemini-backed), /rapid-coach (RapidAPI-backed)
- Vite dev proxy forwards /api and /ws to the Node server on :5180

Dev:
- Create .env with GEMINI_API_KEY (server-only) and optional VITE_* keys
- Run both with: npm run dev:all (frontend) and ensure server runs on port 5180
- Emergency support messages for crisis moments
- Context-aware encouragement based on user progress
- Streak tracking and longest streak records
- Level progression system
- Visual progress indicators
- Celebration of user achievements

### 🆘 Emergency Support System
- Dedicated SOS page with immediate help resources
- 24/7 crisis hotline information
- Guided breathing exercises with animations
- Quick coping strategies and grounding techniques
- Professional help resources and contacts

### 👥 Community Support
- Real-time chat rooms for peer support
- Different rooms for various topics (general, newcomers, celebrations)
- Supportive reactions and engagement features
- Community guidelines and safety measures
- Anonymous support option

### 📚 Resource Library
- Curated articles, videos, and educational content
- Categorized resources (mindfulness, therapy, health, etc.)
- Search and filter functionality
- Featured content highlighting
- Expert-authored content

### 📱 Progressive Web App (PWA)
- Installable on mobile devices
- Offline functionality
- Push notifications for reminders
- Responsive design for all screen sizes

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Beautiful charts and data visualization
- **Lucide React** - Consistent icon library
- **React Router** - Client-side routing

### Backend & Services
- **Supabase** - Backend-as-a-Service (BaaS)
  - PostgreSQL database with RLS
  - Real-time subscriptions
  - Authentication and user management
  - File storage and CDN
- **Gemini API** - AI chat for the coach endpoint
- **PWA Service Worker** - Offline functionality and caching

### Development Tools
- **ESLint** - Code linting and quality
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Supabase account
- Hugging Face account (for AI features)
- Google Cloud Console account (for OAuth)

### 1. Clone and Install
```bash
# Clone the repository
git clone <your-repo-url>
cd addiction-control-app

# Install dependencies
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Add your API keys to .env.local
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_HF_API_TOKEN=your_huggingface_api_token
```

### 3. Database Setup
1. Create a new project in [Supabase](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Copy and run the SQL from `database/schema.sql`
4. Enable Realtime for the `messages` table in Database > Replication

### 4. Authentication Setup
1. **Supabase Auth:**
   - Go to Authentication > Settings in Supabase
   - Configure email templates and redirect URLs

2. **Google OAuth:**
   - Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com)
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
   - Add credentials to Supabase Authentication > Providers > Google

### 5. AI Service Setup
1. Sign up at [Hugging Face](https://huggingface.co)
2. Generate an API token in your account settings
3. Add the token to your `.env.local` file

### 6. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to see the app running!

## 📁 Project Structure

```
addiction-control-app/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.jsx     # Navigation component
│   │   └── LoadingSpinner.jsx
│   ├── contexts/          # React contexts
│   │   └── AuthContext.jsx # Authentication state
│   ├── lib/               # Utility libraries
│   │   ├── supabase.js    # Supabase client and helpers
│   │   ├── ai.js          # AI service integration
│   │   └── utils.js       # Helper functions
│   ├── pages/             # Page components
│   │   ├── Login.jsx      # Authentication page
│   │   ├── Dashboard.jsx  # Main dashboard
│   │   ├── Tracker.jsx    # Habit tracking
│   │   ├── Tips.jsx       # AI-powered tips
│   │   ├── Library.jsx    # Resource library
│   │   ├── Emergency.jsx  # Emergency support
│   │   ├── Community.jsx  # Chat and support
│   │   └── Profile.jsx    # User profile
│   ├── App.jsx            # Main app component
│   ├── main.jsx          # App entry point
│   └── index.css         # Global styles
├── database/
│   └── schema.sql        # Database schema
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🗄️ Database Schema

The app uses a PostgreSQL database with the following main tables:

- **profiles** - User profile information
- **habits** - User-created habits to track
- **habit_logs** - Daily habit completion records
- **daily_goals** - User's daily goal setting
- **resources** - Educational content library
- **badges** - Achievement badges
- **user_badges** - User badge awards
- **messages** - Community chat messages
- **tips** - AI-generated or custom tips

All tables include Row Level Security (RLS) policies for data protection.

## 🔒 Security Features

- **Row Level Security (RLS)** - Database-level access control
- **JWT Authentication** - Secure token-based auth
- **Environment Variables** - Secure API key management
- **Input Validation** - Frontend and backend validation
- **HTTPS Only** - Secure data transmission
- **Privacy Controls** - User-controlled data visibility

## 🎨 UI/UX Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Mode Support** - Coming soon
- **Accessibility** - WCAG compliance considerations
- **Smooth Animations** - Framer Motion powered transitions
- **Loading States** - Proper loading indicators
- **Error Handling** - User-friendly error messages
- **Offline Support** - PWA capabilities

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Your Domain
1. Upload the `dist` folder to your web hosting service
2. Configure environment variables on your hosting platform
3. Set up proper redirects for client-side routing
4. Configure HTTPS and domain settings

### Recommended Hosting Platforms
- **Vercel** - Automatic deployments from Git
- **Netlify** - Easy static site hosting
- **Your Own Server** - Upload dist folder to any web server

## 🔧 Configuration

### Customizing AI Responses
Edit `src/lib/ai.js` to:
- Change AI model endpoints
- Modify fallback quotes
- Adjust prompt engineering
- Add custom response processing

### Adding New Habit Categories
Update the database schema and frontend components to include new habit categories and tracking methods.

### Customizing Gamification
Modify `src/lib/utils.js` to:
- Change badge criteria
- Adjust point calculations
- Add new achievement types
- Customize level progression

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- Check the [documentation](docs/) for detailed guides
- Create an issue for bugs or feature requests
- Join our community discussions

### Emergency Resources
If you're in crisis, please reach out:
- Crisis Text Line: Text HOME to 741741
- National Suicide Prevention Lifeline: 988
- SAMHSA National Helpline: 1-800-662-HELP (4357)

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend platform
- [Hugging Face](https://huggingface.co) for AI model hosting
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- The recovery and mental health communities for inspiration and guidance

---

Built with ❤️ to help people overcome addiction and build healthier habits.
