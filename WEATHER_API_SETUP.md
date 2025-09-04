# Weather API Setup Guide

## Overview
The addiction control app includes a **WeatherAssistant** component that provides:
- Current weather conditions based on user location
- Mood tracking connected to weather
- Personalized activity suggestions based on weather
- Weather-based recovery recommendations

## Current Status
✅ **WeatherAssistant component**: Fully implemented in `src/components/WeatherAssistant.jsx`
✅ **Database table**: `weather_logs` table ready in Supabase
✅ **Dashboard integration**: Component is already used in the Dashboard
❌ **API Key**: Missing OpenWeatherMap API key

## Setup Instructions

### 1. Get OpenWeatherMap API Key

1. **Sign up** at [OpenWeatherMap](https://openweathermap.org/api)
2. **Choose plan**: Free tier includes 1,000 calls/day (sufficient for testing)
3. **Get API key** from your dashboard
4. **Add to environment**: Update `.env` file

```env
# Weather API - Required for weather-based mood suggestions
VITE_OPENWEATHERMAP_API_KEY=your-actual-api-key-here
```

### 2. Restart Development Server
```bash
npm run dev
```

### 3. Test the Feature
1. Navigate to **Dashboard** page
2. Allow **location access** when prompted
3. See **Weather & You** panel with:
   - Current weather conditions
   - Temperature and description
   - Mood tracking slider
   - Craving level (0-10)
   - Personalized suggestions

## Features

### Weather-Based Suggestions
- **Rainy weather**: Indoor meditation and breathing exercises
- **Clear skies**: Outdoor walks and fresh air activities
- **Cloudy days**: Journaling and cozy indoor activities
- **Default**: Mindful breathing and balanced activities

### Data Tracking
- **Weather conditions**: Stored with timestamp
- **Mood correlation**: Track mood alongside weather
- **Craving levels**: Monitor addiction cravings vs weather
- **Personal insights**: Build patterns over time

### Privacy & Permissions
- **Location**: Uses browser geolocation (requires user permission)
- **Fallback**: Uses NYC coordinates if location denied
- **Data storage**: Personal weather logs stored securely in Supabase
- **RLS enabled**: Users only see their own data

## Database Schema

```sql
Table: weather_logs
- id (Primary Key)
- user_id (Foreign Key to auth.users)
- created_at (Timestamp)
- condition (Rain, Clear, Clouds, etc.)
- description (Detailed weather description)
- temp_c (Temperature in Celsius)
- city (Location name)
- mood (User-selected mood)
- craving_level (0-10 scale)
- suggestion (AI-generated activity suggestion)
```

## Troubleshooting

### Common Issues
1. **"Missing API Key"**: Add `VITE_OPENWEATHERMAP_API_KEY` to `.env`
2. **Location denied**: Component falls back to NYC coordinates
3. **API quota exceeded**: Free tier has 1,000 calls/day limit
4. **Database errors**: Ensure `weather_logs` table exists in Supabase

### Error Messages
- `Missing VITE_OPENWEATHERMAP_API_KEY in .env.local`: Add API key
- `Location unavailable`: Grant location permission or use fallback
- `Could not load weather`: Check API key and internet connection
- `Weather log not persisted (likely demo mode)`: Database write failed (non-fatal)

## Component Location
- **File**: `src/components/WeatherAssistant.jsx`
- **Used in**: `src/pages/Dashboard.jsx`
- **Database**: `database/weather_logs.sql`
- **Environment**: `.env` file

## Benefits for Recovery
1. **Environmental awareness**: Understanding how weather affects mood
2. **Proactive suggestions**: Weather-appropriate coping strategies
3. **Data correlation**: Track patterns between weather and cravings
4. **Personalized support**: Tailored activity recommendations
5. **Mindful engagement**: Encourages present-moment awareness

## Next Steps
1. **Get API key** from OpenWeatherMap
2. **Add to .env** file
3. **Restart server** to load new environment variables
4. **Test the feature** on the Dashboard
5. **Monitor usage** and API quota

The weather integration adds a valuable environmental context to recovery tracking!
