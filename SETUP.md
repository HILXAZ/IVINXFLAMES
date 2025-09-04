# Addiction Control - Complete Setup Guide

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd addiction
npm install
```

### 2. Environment Setup
Create `.env.local` file in root directory:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_HF_API_TOKEN=your_huggingface_api_token
```

### 3. Database Setup
1. Go to [Supabase](https://supabase.com) and create a new project
2. In SQL Editor, run the complete schema from `database/schema.sql`
3. Enable realtime for messages table (done automatically in schema)

### 4. API Keys Setup

#### Supabase Setup:
1. Create account at [Supabase](https://supabase.com)
2. Create new project
3. Go to Settings → API
4. Copy Project URL and anon/public key
5. Configure authentication providers in Authentication → Settings

#### Hugging Face API:
1. Create account at [Hugging Face](https://huggingface.co)
2. Go to Settings → Access Tokens
3. Create new token with read permissions
4. Copy token for VITE_HF_API_TOKEN

### 5. Development
```bash
npm run dev
```

## 📱 PWA Features

### Service Worker
- Automatic caching for offline functionality
- Background sync for habit logs
- Push notification support
- Update notifications

### Installation
- Add to home screen on mobile devices
- Standalone app experience
- Offline functionality

### Notifications
- Habit reminders
- Streak celebrations
- Emergency alerts
- App updates

## 🗄️ Database Schema

### Core Tables:
- **profiles**: User profile information
- **habits**: User-defined habits to track
- **habit_logs**: Daily habit logging entries
- **daily_goals**: Personal daily objectives
- **badges**: Achievement system
- **user_badges**: User's earned badges
- **resources**: Help articles and resources
- **messages**: Community chat messages
- **analytics_events**: Usage analytics

### Security:
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Public read access for resources and badges
- Secure community chat with user attribution

## 🔒 Security Features

### Authentication
- Supabase Auth with email/password
- Google OAuth integration
- Magic link support
- Password reset functionality

### Data Protection
- Row Level Security policies
- API key protection (client-side limitation noted)
- Input validation and sanitization
- HTTPS enforcement in production

### Privacy
- User data isolation
- Optional profile privacy settings
- Analytics data anonymization
- GDPR compliance ready

## 🎯 Features Implemented

### ✅ Core Features
- [x] User authentication and profiles
- [x] Habit creation and tracking
- [x] Daily goal setting
- [x] Progress visualization with charts
- [x] Streak tracking and badges
- [x] AI-powered motivation tips
- [x] Live voice AI assistant
- [x] Emergency help resources
- [x] Community chat
- [x] Resource library

### ✅ Technical Features
- [x] PWA with offline support
- [x] Service worker for caching
- [x] Push notifications
- [x] Analytics tracking
- [x] Error boundary
- [x] Responsive design
- [x] Dark mode ready
- [x] Performance optimization

### ✅ AI Integration
- [x] Hugging Face API integration
- [x] Speech recognition (browser API)
- [x] Text-to-speech (browser API)
- [x] Contextual AI responses
- [x] Motivational tip generation

## 📊 Analytics

### Tracked Events:
- Page views and navigation
- Habit creation and logging
- Streak achievements
- Badge earnings
- AI assistant usage
- Community interactions
- Error occurrences
- Performance metrics

### Data Storage:
- Supabase analytics_events table
- Google Analytics integration ready
- User privacy respecting
- GDPR compliant data collection

## 🔧 Advanced Configuration

### Environment Variables:
```bash
# Required
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_HF_API_TOKEN=your_huggingface_token

# Optional
VITE_GA_TRACKING_ID=your_google_analytics_id
VITE_SENTRY_DSN=your_sentry_dsn
VITE_APP_VERSION=1.0.0
```

### Performance Optimization:
- Code splitting with lazy loading
- Image optimization
- Bundle size optimization
- CDN integration ready
- Caching strategies

### SEO Ready:
- Meta tags for social sharing
- Structured data
- Sitemap generation
- Robot.txt configuration
- Performance optimization

## 🚀 Deployment

### Vercel (Recommended):
```bash
npm install -g vercel
vercel --prod
```

### Netlify:
```bash
npm run build
# Upload dist folder to Netlify
```

### Environment Variables in Production:
Set all VITE_ variables in your hosting platform's environment settings.

## 🧪 Testing

### Unit Tests:
```bash
npm run test
```

### E2E Tests:
```bash
npm run test:e2e
```

### Performance Testing:
```bash
npm run lighthouse
```

## 📱 Mobile Considerations

### iOS Safari:
- Add to home screen instructions
- iOS-specific meta tags
- Touch icon configuration
- Status bar styling

### Android Chrome:
- Web app manifest
- Chrome install prompt
- Material design principles
- Gesture navigation support

## 🔍 Troubleshooting

### Common Issues:

1. **Voice Recognition Not Working:**
   - Ensure HTTPS in production
   - Check browser permissions
   - Use supported browsers (Chrome, Edge, Safari)

2. **Supabase Connection Issues:**
   - Verify environment variables
   - Check project URL and keys
   - Ensure RLS policies are correct

3. **PWA Installation Issues:**
   - Check manifest.json validity
   - Ensure HTTPS in production
   - Verify service worker registration

4. **Hugging Face API Errors:**
   - Check API token validity
   - Monitor rate limits
   - Handle network timeouts

## 📞 Support

### Documentation:
- [Supabase Docs](https://supabase.com/docs)
- [Hugging Face API](https://huggingface.co/docs)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)

### Community:
- GitHub Issues for bug reports
- Discord community for support
- Stack Overflow for technical questions

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 🔄 Updates

### Version 1.0.0:
- Complete addiction control web app
- Voice AI assistant
- PWA functionality
- Community features
- Analytics integration

### Roadmap:
- [ ] iOS/Android native apps
- [ ] Advanced AI coaching
- [ ] Therapist integration
- [ ] Family account support
- [ ] Multi-language support
