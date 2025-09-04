// Simple JokeAPI client (no API key needed)
// Docs: https://jokeapi.dev/

export async function fetchJoke({ category = 'Any', safeMode = true } = {}) {
  const params = new URLSearchParams()
  if (safeMode) params.set('safe-mode', '')
  // Filter out highly offensive categories by default via blacklist (if not using safe-mode)
  // You can customize using blacklistFlags param if needed.

  const url = `https://v2.jokeapi.dev/joke/${encodeURIComponent(category)}?${params.toString()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`JokeAPI error: ${res.status}`)
  const data = await res.json()
  if (data.error) throw new Error(data.message || 'Failed to fetch joke')
  return data
}
