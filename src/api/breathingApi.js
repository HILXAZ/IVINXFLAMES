async function fetchWithAuth(url, options = {}, session) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const breathingApiKey = import.meta.env.VITE_BREATHING_API_KEY;

  if (breathingApiKey) {
    headers['Authorization'] = `Bearer ${breathingApiKey}`;
  } else if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  return fetch(url, { ...options, headers });
}

export async function startBreathingSession(baseUrl, payload, session) {
  const res = await fetchWithAuth(`${baseUrl}/api/breathing/start`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, session)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function endBreathingSession(baseUrl, payload, session) {
  const res = await fetchWithAuth(`${baseUrl}/api/breathing/end`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, session)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getBreathingStats(baseUrl, user_id, session) {
  const res = await fetchWithAuth(`${baseUrl}/api/breathing/stats/${user_id}`, {}, session)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
