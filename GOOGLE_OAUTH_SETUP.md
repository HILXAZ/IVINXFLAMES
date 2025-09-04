# Google OAuth Setup Instructions

## 🔧 Fix the "redirect_uri_mismatch" Error

### Step 1: Google Cloud Console Configuration

1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **Find your OAuth 2.0 Client ID**: `<YOUR_GOOGLE_CLIENT_ID>`
3. **Click the pencil icon** to edit
4. **In "Authorized redirect URIs", add EXACTLY these URLs** (copy-paste to avoid typos):

```
https://otnuqynwyzcgonzfppwm.supabase.co/auth/v1/callback
http://localhost:5173/auth/callback
http://localhost:5174/auth/callback
```

5. **Click "SAVE"**
6. **Wait 5-10 minutes** for Google to propagate the changes

### Step 2: Supabase Dashboard Configuration

1. **Go to**: https://supabase.com/dashboard/project/<YOUR_SUPABASE_REF>/auth/providers
2. **Click on "Google"** to configure
3. **Enable the toggle** for Google
4. **Enter these credentials**:
   - **Client ID**: `<YOUR_GOOGLE_CLIENT_ID>`
   - **Client Secret**: `<YOUR_GOOGLE_CLIENT_SECRET>`
5. **Click "Save"**

### Step 3: Test Your Setup

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Go to your app**: http://localhost:5174/ (or whatever port it's running on)

3. **Click "Continue with Google"**

4. **Should work without errors**

## 🚨 Troubleshooting

### If you still get redirect_uri_mismatch:

1. **Double-check** that the URLs in Google Cloud Console are EXACTLY:
   ```
   https://otnuqynwyzcgonzfppwm.supabase.co/auth/v1/callback
   http://localhost:5173/auth/callback
   http://localhost:5174/auth/callback
   ```

2. **Wait longer** - Google can take up to 30 minutes to propagate changes

3. **Check the error URL** - if Google shows a different callback URL in the error, add that exact URL to your Google Cloud Console

### If Google OAuth is not enabled in Supabase:

1. Make sure you've enabled the Google provider in Supabase
2. Check that your Client ID and Secret are correct
3. Verify your Supabase project URL is correct

## ✅ Current App Status

- **Email/Password Auth**: ✅ Working
- **Google OAuth**: ⚠️ Needs configuration
- **All Features**: ✅ Ready to use
- **Database Schema**: ⚠️ Run database-schema.sql in Supabase SQL Editor

## 🎯 Your Credentials Summary

- **Supabase URL**: https://<YOUR_SUPABASE_REF>.supabase.co
- **Google Client ID**: <YOUR_GOOGLE_CLIENT_ID>
- **Google Client Secret**: <YOUR_GOOGLE_CLIENT_SECRET>

## 📱 App Features Working

Once authentication is set up, your addiction control app includes:
- ✅ Habit tracking and analytics
- ✅ AI-powered motivation tips
- ✅ Community support chat
- ✅ Emergency resources
- ✅ Educational library
- ✅ Gamification with badges
- ✅ Progress dashboard

Your app is ready to help people on their recovery journey! 🌟
