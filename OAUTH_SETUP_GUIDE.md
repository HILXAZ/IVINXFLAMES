# OAuth Setup Guide for Addiction Recovery App

## Problem
You're getting "Error 400: redirect_uri_mismatch" when trying to sign in with Google.

## Root Cause
Your app is running on `http://localhost:5174/` but Google OAuth is configured for a different URL.

## Solution
Configure proper redirect URLs in both Supabase and Google OAuth.

## Supabase Configuration

### 1. Site URL Configuration
In your Supabase dashboard:
- Go to Authentication → Settings
- Set **Site URL** to: `http://localhost:5174` (current dev server)
- For production: Set to your actual domain

### 2. Redirect URLs Configuration
In the **Redirect URLs** section, add these URLs:

#### Development URLs:
```
http://localhost:5174/auth/callback
http://localhost:5174
http://localhost:5173/auth/callback
http://localhost:5173
```

#### Production URLs (replace with your actual domain):
```
https://yourdomain.com/auth/callback
https://yourdomain.com
```

## Google OAuth Configuration

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google OAuth2 API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"

### 2. OAuth Client Configuration
Set up these **Authorized JavaScript origins**:
```
http://localhost:5174
http://localhost:5173
https://yourdomain.com (for production)
```

Set up these **Authorized redirect URIs**:
```
https://otnuqynwyzcgonzfppwm.supabase.co/auth/v1/callback
```

**CRITICAL:** The redirect URI in Google must be exactly:
`https://otnuqynwyzcgonzfppwm.supabase.co/auth/v1/callback`

### 3. Supabase Google Provider Setup
In Supabase dashboard:
1. Go to Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console

## Your Google OAuth Configuration

**Your Client ID:** `505403591548-tq3k467vg82i75jt8c13f5b2q2bhv9is.apps.googleusercontent.com`

### Complete Setup Checklist:

### ✅ **1. Google Cloud Console Configuration**
Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

1. **Find your OAuth 2.0 Client ID:** `505403591548-tq3k467vg82i75jt8c13f5b2q2bhv9is.apps.googleusercontent.com`
2. **Click to edit it**
3. **Authorized JavaScript origins** - Add these exactly:
   ```
   http://localhost:5174
   http://localhost:5173
   ```
4. **Authorized redirect URIs** - Add this exactly:
   ```
   https://otnuqynwyzcgonzfppwm.supabase.co/auth/v1/callback
   ```
5. **Save** the configuration

### ✅ **2. Supabase Configuration**
Go to your Supabase dashboard → Authentication → Providers → Google:

1. **Enable Google Provider**
2. **Client ID:** `505403591548-tq3k467vg82i75jt8c13f5b2q2bhv9is.apps.googleusercontent.com`
3. **Client Secret:** (Copy from Google Cloud Console)

### ✅ **3. Supabase URLs Configuration**
In Authentication → Settings:

1. **Site URL:** `http://localhost:5174`
2. **Redirect URLs:** Add these:
   ```
   http://localhost:5174/auth/callback
   http://localhost:5174
   ```

## Quick Fix Steps

### Immediate Solution:
1. **Go to Google Cloud Console**
2. **Find your OAuth 2.0 Client ID**
3. **Edit the client**
4. **In "Authorized JavaScript origins" add:**
   - `http://localhost:5174`
5. **In "Authorized redirect URIs" make sure you have:**
   - `https://otnuqynwyzcgonzfppwm.supabase.co/auth/v1/callback`
6. **Save the configuration**

### Test Again:
1. Clear your browser cache
2. Try Google sign-in again
3. Check browser console for debug logs

## Environment Variables
Add to your `.env` file:
```
VITE_SUPABASE_URL=https://otnuqynwyzcgonzfppwm.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Testing Steps
1. Configure all URLs as above
2. Test email/password signup first
3. Test Google OAuth login
4. Verify you're redirected to `/auth/callback` then to `/dashboard`

## Current App Configuration
The app is configured to:
- Redirect to `/auth/callback` after OAuth
- Handle both email confirmation and OAuth callbacks
- Automatically navigate to `/dashboard` on successful auth

## Troubleshooting
- If still getting Supabase callback URL, double-check redirect URLs
- Make sure Google provider is enabled in Supabase
- Verify Google OAuth client credentials are correct
- Check browser developer tools for error messages
