# 🔧 GOOGLE OAUTH CONFIGURATION GUIDE

## ✅ **GOOGLE CLIENT ID UPDATED**

I've updated your local environment variables with the new Google Client ID you provided.

---

## 🚨 **REQUIRED ACTIONS TO FIX GOOGLE SIGN-IN:**

### **Step 1: Update Supabase Configuration**

1. **Go to Supabase Dashboard:**
   - Navigate to your project's Auth Providers section

2. **Click on "Google" provider**

3. **Update the credentials:**
   - **Client ID:** Use the new Client ID you provided (starting with 505403591548...)
   - **Client Secret:** Use your corresponding Client Secret
   
4. **Make sure Google provider is ENABLED**

5. **Click "Save"**

### **Step 2: Configure Google Cloud Console**

1. **Go to Google Cloud Console Credentials page**

2. **Find your OAuth 2.0 Client** (the one starting with 505403591548...)

3. **Click the pencil/edit icon**

4. **Add these EXACT redirect URIs:**
   ```
   https://otnuqynwyzcgonzfppwm.supabase.co/auth/v1/callback
   https://ivinnsibiflamex.netlify.app/auth/callback
   http://localhost:5173/auth/callback
   http://localhost:5174/auth/callback
   ```

5. **Click "SAVE"**

6. **Wait 5-10 minutes** for Google to propagate changes

### **Step 3: Update Netlify Environment Variables**

1. **Go to your Netlify site settings**

2. **Navigate to Environment Variables section**

3. **Update this variable:**
   - **Key:** `VITE_GOOGLE_CLIENT_ID`
   - **Value:** Your new Client ID (starting with 505403591548...)

4. **Click "Save"**

5. **Trigger a new deployment**

---

## 🧪 **TEST YOUR SETUP:**

### **After completing all steps above:**

1. **Test Production:**
   - Go to: https://ivinnsibiflamex.netlify.app
   - Click "Google Account" button
   - Should work without errors!

2. **Test Local Development:**
   - Run: `npm run dev`
   - Go to your local URL
   - Click "Google Account" button
   - Should redirect to Google properly

---

## 📋 **VERIFICATION CHECKLIST:**

### ✅ **Configuration Steps:**
- [x] **.env.local updated** with new Google Client ID
- [ ] **Supabase updated** with new Google Client ID  
- [ ] **Google Cloud Console** redirect URIs configured
- [ ] **Netlify environment** variables updated
- [ ] **Production deployment** with new credentials

### ✅ **Expected Result:**
1. Click "Google Account" → Opens Google login
2. Choose Google account → Authenticates successfully
3. Redirected to dashboard → Full app access

---

## 🎯 **IMPORTANT NOTES:**

**Required Redirect URIs for Google Cloud Console:**
- Supabase callback URL (your Supabase project)
- Production app callback URL (Netlify)
- Development callback URLs (localhost)

**Three platforms need the same Client ID:**
1. ✅ **Local Environment** (already updated)
2. ⚠️ **Supabase Dashboard** (needs update)
3. ⚠️ **Netlify Environment** (needs update)

**After configuration, Google OAuth will work perfectly!**

---

## 🛠️ **TROUBLESHOOTING:**

**If still getting errors:**
1. Check browser console for specific error messages
2. Verify all redirect URIs are exactly correct (no typos)
3. Wait full 10 minutes after Google Cloud Console changes
4. Try different browser or disable popup blockers
5. Use the debug tool at: `/google-oauth-debug.html`

**Email/password login works as a backup while configuring Google OAuth.**

---

*Updated: September 5, 2025*
*Status: Local config updated, needs Supabase & Netlify update*
