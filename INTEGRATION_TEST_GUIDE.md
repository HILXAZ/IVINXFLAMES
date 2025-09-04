# MindBalance Voice AI Assistant - Integration Test Guide

## Test Scenario 1: Landing Page to Voice Assistant Flow

### Step 1: Access Landing Page
- Navigate to `http://localhost:5176/landing.html`
- Verify glassmorphism design loads correctly
- Check responsive layout on different screen sizes

### Step 2: Navigation to App
- Click "Get Started" or "Sign In" button
- Verify smooth transition with loading animation
- Confirm redirect to React app login page

### Step 3: Authentication
- Use email signup/login (Google OAuth temporarily disabled)
- Test email: test@example.com
- Test password: password123

### Step 4: Voice Assistant Access
- Navigate to `/assistant` page after login
- Grant microphone permissions when prompted
- Test voice interaction with phrases like:
  - "I'm feeling stressed"
  - "Help me with my addiction"
  - "I want to talk about my recovery"

## Test Scenario 2: Direct Voice Assistant Access

### Prerequisites
- Modern browser (Chrome, Firefox, Safari, Edge)
- Microphone permissions granted
- Internet connection for AI responses

### Test Steps
1. Navigate directly to `http://localhost:5176/assistant`
2. Click "Start Voice Chat" button
3. Speak when prompted: "Hello, I need support"
4. Verify:
   - Speech recognition captures your words
   - AI provides contextual addiction recovery response
   - Text-to-speech reads response aloud
   - Conversation history displays properly

## Test Scenario 3: Error Handling

### Speech Recognition Errors
- Test with no microphone access
- Test with very quiet speech (timeout scenario)
- Test with background noise

### Network Errors
- Test with poor internet connection
- Verify fallback messages display
- Confirm graceful degradation

## Test Scenario 4: PWA Features

### Installation Test
- Look for browser install prompt
- Test "Add to Home Screen" functionality
- Verify app works when installed

### Offline Capability
- Disconnect internet after loading
- Verify core features still accessible
- Test offline voice recognition (browser-based)

## Expected Results

### Voice Assistant Performance
- ✅ Quick response time (< 3 seconds)
- ✅ Accurate speech recognition
- ✅ Contextual addiction recovery responses
- ✅ Clear text-to-speech output
- ✅ Proper error handling

### User Experience
- ✅ Intuitive navigation
- ✅ Professional design
- ✅ Accessibility compliance
- ✅ Mobile-responsive layout
- ✅ Fast loading times

### Technical Integration
- ✅ Seamless landing page to app transition
- ✅ Proper authentication flow
- ✅ PWA installation capability
- ✅ Browser compatibility
- ✅ API key security (client-side implementation)

## Troubleshooting

### Common Issues
1. **Microphone not working**: Check browser permissions
2. **AI responses slow**: Verify Hugging Face API key
3. **Speech recognition fails**: Use supported browser
4. **Landing page not loading**: Check static file serving

### Debug Commands
```bash
# Check server status
curl http://localhost:5176/health

# Verify static files
curl http://localhost:5176/landing.html

# Test API connectivity
curl -H "Authorization: Bearer YOUR_HF_TOKEN" https://api-inference.huggingface.co/models/microsoft/DialoGPT-small
```

## Performance Benchmarks

### Page Load Times
- Landing page: < 1 second
- React app: < 2 seconds
- Voice assistant: < 1 second

### Voice Response Times
- Speech to text: < 1 second
- AI processing: < 3 seconds
- Text to speech: < 1 second
- Total interaction: < 5 seconds

## Success Criteria
- [ ] Landing page loads with glassmorphism design
- [ ] Navigation to React app works smoothly
- [ ] Voice assistant responds appropriately to addiction recovery queries
- [ ] All error scenarios handled gracefully
- [ ] PWA features functional
- [ ] Mobile responsiveness confirmed
- [ ] Accessibility standards met
