Environment keys used by the app (server-side only unless noted):

Required (existing):
- VITE_SUPABASE_URL (client)
- VITE_SUPABASE_ANON_KEY (client)

Optional AI providers:
- GEMINI_API_KEY or GOOGLE_GENAI_API_KEY (server) — used by /api/coach/chat
- OPENROUTER_API_KEY (server) — fallback if Gemini is not configured
- VITE_HF_API_TOKEN (client) — used only by the client-side Assistant page
- VITE_VAPI_PUBLIC_KEY (client) and VITE_VAPI_ASSISTANT_ID (client) — for VoiceMentor
- VITE_RAPIDAPI_KEY (client) — for Rapid Coach page

Notes:
- Do NOT commit real secrets. Use .env (server) and .env.local (vite) locally.
- Prefer server-side keys so they aren’t exposed in the browser.
