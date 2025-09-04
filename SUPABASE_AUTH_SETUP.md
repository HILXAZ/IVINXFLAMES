# Supabase Authentication Setup Guide

## 🔧 Current Error Fix: "Unsupported provider: provider is not enabled"

This error occurs when Google OAuth is not properly configured in Supabase. Here's how to fix it:

## 📋 Step-by-Step Supabase Authentication Setup

### 1. Enable Google OAuth in Supabase Dashboard

1. **Go to your Supabase project dashboard**:
   - Visit: https://supabase.com/dashboard
   - Select your project: `<YOUR_SUPABASE_REF>`

2. **Navigate to Authentication settings**:
   - Click "Authentication" in the left sidebar
   - Click "Providers" tab
   - Find "Google" in the list

3. **Enable Google OAuth**:
    - Toggle the "Enable sign in with Google" switch to ON
    - Fill in the required fields:
       - **Client ID**: `<YOUR_GOOGLE_CLIENT_ID>`
       - **Client Secret**: `<YOUR_GOOGLE_CLIENT_SECRET>`

4. **Configure redirect URL**:
   - **Authorized redirect URL**: `https://<YOUR_SUPABASE_REF>.supabase.co/auth/v1/callback`
   - Click "Save"

### 2. Verify Google Cloud Console Setup

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Navigate to OAuth Consent Screen**:
   - APIs & Services → OAuth consent screen
   - Ensure your app is configured properly

3. **Check Credentials**:
   - APIs & Services → Credentials
   - Find your OAuth 2.0 Client ID
   - Add authorized redirect URIs:
     - `https://otnuqynwyzcgonzfppwm.supabase.co/auth/v1/callback`
     - `http://localhost:5175/auth/callback` (for development)

### 3. Enable Required Google APIs

In Google Cloud Console:
1. **APIs & Services → Library**
2. **Enable these APIs**:
   - Google+ API (if available)
   - Google People API
   - Google Identity Service

### 4. Test Configuration

After setup, test the authentication:
1. Go to your app: http://localhost:5175
2. Click "Continue with Google"
3. Should redirect to Google login
4. After success, should redirect back to your app

## 🔄 Alternative: Disable Google OAuth (Quick Fix)

If you want to use only email/password authentication for now:

### Option 1: Remove Google Button from UI
1. Comment out the Google login button in Login.jsx
2. Use only email/password authentication

### Option 2: Create Email-Only Login Component
- Focus on core addiction control features
- Add OAuth later when fully configured

## 📱 Complete Authentication Flow

### Supported Methods:
1. **Email/Password** ✅ (Working)
2. **Google OAuth** ⚠️ (Needs Supabase config)
3. **Magic Links** ✅ (Should work)

### Current Status:
- Supabase project: ✅ Active
- Database schema: ✅ Ready
- Email auth: ✅ Working
- Google OAuth: ❌ Needs configuration

## 🎯 Recommended Action

**Immediate Fix** (to get app working now):
1. Temporarily disable Google OAuth button
2. Use email/password authentication
3. Configure Google OAuth later

**Complete Fix** (for production):
1. Follow the Supabase setup steps above
2. Verify Google Cloud Console configuration
3. Test OAuth flow thoroughly

## 💡 Quick Workaround

I can create a version without Google OAuth that works immediately with just email/password authentication. Would you like me to implement this quick fix?

## 🔍 Debugging Steps

1. **Check Supabase logs**:
   - Dashboard → Logs → Auth logs
   - Look for detailed error messages

2. **Verify environment variables**:
   - VITE_SUPABASE_URL: ✅ Set
   - VITE_SUPABASE_ANON_KEY: ✅ Set

3. **Test basic auth**:
   - Try email/password registration first
   - Confirm email verification works

## ⚡ Next Steps

Choose one approach:
- **A)** Configure Google OAuth in Supabase (15-20 minutes)
- **B)** Disable Google OAuth for now (2 minutes)
- **C)** I can implement the quick fix for you

Let me know which approach you'd prefer!
