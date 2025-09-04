                                                                    // AI Health Coach API client (RapidAPI)
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY
const API_URL = 'https://ai-life-coach-api-personal-development-online-coaching.p.rapidapi.com/getLifeAdvice?noqueue=1'

export async function getLifeAdvice(payload) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': 'ai-life-coach-api-personal-development-online-coaching.p.rapidapi.com',
      'x-rapidapi-key': RAPIDAPI_KEY
    },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
