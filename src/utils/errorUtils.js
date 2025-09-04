// Error recovery utilities - Simple ES6 syntax
export function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

export function safeLocalStorageGet(key, fallback = null) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

export function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function createSafeWrapper(fn, fallback = null) {
  return function safeFunction(...args) {
    try {
      return fn(...args)
    } catch (error) {
      console.error('Function error:', error)
      return fallback
    }
  }
}

export async function retryAsync(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

export function clearAllData() {
  try {
    localStorage.clear()
    sessionStorage.clear()
    
    // Clear any cached service worker data
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister())
      })
    }
    return true
  } catch (error) {
    console.error('Failed to clear data:', error)
    return false
  }
}
