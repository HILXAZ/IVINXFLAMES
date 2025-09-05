# 🔧 GOOGLE CLOUD CONSOLE SETUP GUIDE

## 🎯 **YOUR GOOGLE CLIENT ID:** `505403591548-9bbu3bjafmded95j2pla25qif05f0i62.apps.googleusercontent.com`

---

## 🚨 **STEP-BY-STEP GOOGLE CLOUD CONSOLE CONFIGURATION:**

### **Step 1: Access Google Cloud Console**

1. **Open browser** and go to: https://console.cloud.google.com/apis/credentials

2. **Sign in** with your Google account

3. **Select your project** (or create one if needed)

### **Step 2: Find Your OAuth 2.0 Client**

1. **Look for "OAuth 2.0 Client IDs"** section

2. **Find your client** starting with: `505403591548-9bbu3bjafmded95j2pla25qif05f0i62`

3. **Click the pencil/edit icon** next to it

### **Step 3: Configure Authorized Redirect URIs**

**In the "Authorized redirect URIs" section, add these EXACT URLs:**

```
https://otnuqynwyzcgonzfppwm.supabase.co/auth/v1/callback
https://ivinnsibiflamex.netlify.app/auth/callback
http://localhost:5173/auth/callback
http://localhost:5174/auth/callback
http://localhost:3000/auth/callback
```

**⚠️ IMPORTANT:** 
- Copy-paste each URL exactly (no typos!)
- Each URL should be on a separate line
- Make sure there are no extra spaces

### **Step 4: Save Changes**

1. **Click "SAVE"** button

2. **Wait 5-10 minutes** for Google to update their servers

---

## 🔍 **IF YOU DON'T HAVE AN OAUTH CLIENT:**

### **Create New OAuth 2.0 Client:**

1. **Click "CREATE CREDENTIALS"** → "OAuth client ID"

2. **Application type:** Web application

3. **Name:** Addiction Control App (or any name you prefer)

4. **Authorized redirect URIs:** Add the URLs from Step 3 above

5. **Click "CREATE"**

6. **Copy the Client ID and Client Secret** (you'll need these for Supabase)

---

## 🎯 **VERIFICATION:**

### **Your URLs should look exactly like this in Google Console:**

✅ `https://otnuqynwyzcgonzfppwm.supabase.co/auth/v1/callback`
✅ `https://ivinnsibiflamex.netlify.app/auth/callback`  
✅ `http://localhost:5173/auth/callback`
✅ `http://localhost:5174/auth/callback`
✅ `http://localhost:3000/auth/callback`

### **Common Mistakes to Avoid:**
❌ Missing `https://` or `http://`
❌ Extra spaces or characters
❌ Wrong domain names
❌ Missing `/auth/callback` path

---

## 🧪 **TEST YOUR SETUP:**

### **After saving in Google Console:**

1. **Wait 10 minutes** for changes to propagate

2. **Go to your app:** https://ivinnsibiflamex.netlify.app

3. **Click "Google Account" button**

4. **Should redirect to Google login** (no errors!)

### **If still getting errors:**

- Check the exact error message in browser console
- Verify URLs are exactly correct in Google Console
- Wait longer (up to 30 minutes for full propagation)
- Try incognito/private browsing mode

---

## 📝 **NEXT STEPS AFTER GOOGLE CONSOLE:**

### **Also update these platforms:**

1. **Supabase Dashboard:**
   - Go to Auth → Providers → Google
   - Enter your Client ID and Secret
   - Enable Google provider

2. **Netlify Environment Variables:**
   - Update `VITE_GOOGLE_CLIENT_ID` with your Client ID

---

## 🎊 **EXPECTED RESULT:**

**After proper Google Console setup:**
1. Click "Google Account" → Opens Google login popup
2. Choose account → Authenticates successfully  
3. Redirected to dashboard → Full app access

**The key is making sure the redirect URIs in Google Console exactly match what your app expects!**

---

*Google Cloud Console is the main configuration point for OAuth*
*All redirect URIs must be registered there for security*
