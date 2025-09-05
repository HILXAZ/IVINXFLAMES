# ⚡ QUICK SETUP: Environment Variables for Netlify

## 🎯 **Your Website is Live but needs API keys to function fully**

**Current URL:** https://ivinnsibiflamex.netlify.app

## 🔑 **Step 1: Add Environment Variables to Netlify**

### **Option A: Via Netlify Dashboard (Recommended)**

1. **Visit:** https://app.netlify.com/projects/ivinnsibiflamex/settings/env
2. **Click:** "Add environment variable" for each one below
3. **Add these exact variables:**

```
VITE_SUPABASE_URL
https://otnuqynwyzcgonzfppwm.supabase.co

VITE_SUPABASE_ANON_KEY  
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bnVxeW53eXpjZ29uemZwcHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MTQwMTcsImV4cCI6MjA3MDI5MDAxN30.MvEWDC44ppFmRSdMwUkT7R-CmBG-YQxzJx0q36O6Myk

VITE_GEMINI_API_KEY
[Use your existing Gemini API key]

VITE_HF_API_TOKEN
[Use your existing Hugging Face token]

VITE_RAPIDAPI_KEY
[Use your existing RapidAPI key]

VITE_BREATHING_API_KEY
[Use your existing Breathing API key]

VITE_OPENWEATHERMAP_API_KEY
[Use your existing OpenWeatherMap API key]

VITE_SERVER_PORT
5180
```

### **Option B: Via Netlify CLI**

```powershell
netlify env:set VITE_SUPABASE_URL "https://otnuqynwyzcgonzfppwm.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "[your-supabase-anon-key]"
netlify env:set VITE_GEMINI_API_KEY "[your-gemini-api-key]"
netlify env:set VITE_HF_API_TOKEN "[your-huggingface-token]"
netlify env:set VITE_RAPIDAPI_KEY "[your-rapidapi-key]"
netlify env:set VITE_BREATHING_API_KEY "[your-breathing-api-key]"
netlify env:set VITE_OPENWEATHERMAP_API_KEY "[your-weather-api-key]"
netlify env:set VITE_SERVER_PORT "5180"
```

## 🚀 **Step 2: Redeploy with Environment Variables**

After adding the environment variables:

```powershell
# Redeploy to apply environment variables
netlify deploy --prod --dir=dist
```

Or trigger automatic deployment by pushing to GitHub:

```powershell
git commit --allow-empty -m "Trigger redeploy with environment variables"
git push
```

## ✅ **What Will Work After Environment Setup:**

- 🤖 **AI Assistant** - Chat functionality with Gemini AI
- 👤 **User Accounts** - Registration, login, profiles via Supabase
- 📊 **Progress Tracking** - Save and view your recovery progress
- 🧘 **Breathing Exercises** - API-powered guided sessions
- 🏃 **Exercise Library** - Video content and workout plans
- 🌤️ **Weather Integration** - Mood suggestions based on weather
- 💬 **Community Features** - Real-time chat and support

## 🌐 **Your URLs:**

- **Production:** https://ivinnsibiflamex.netlify.app
- **Admin Panel:** https://app.netlify.com/projects/ivinnsibiflamex
- **Environment Settings:** https://app.netlify.com/projects/ivinnsibiflamex/settings/env

---

## 🎉 **Summary:**

✅ **Vercel Removed** - No more login redirects  
✅ **Netlify Deployed** - Better hosting for your React app  
✅ **Global CDN** - Fast worldwide loading  
✅ **Auto-Deploy** - Updates automatically from GitHub  

**Next:** Add environment variables → Full functionality restored!

*Your addiction control platform is ready to help users worldwide! 🌍*
