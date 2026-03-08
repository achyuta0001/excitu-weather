const CACHE_KEY = 'excitu_weather_cache'
const MAX_AGE_MS = 10 * 60 * 1000 // 10 minutes

interface CacheEntry<T> {
  data: T
  timestamp: number
}

export function cacheSet<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() }
    localStorage.setItem(`${CACHE_KEY}_${key}`, JSON.stringify(entry))
  } catch {
    // Storage quota exceeded or unavailable — silently ignore
  }
}

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}_${key}`)
    if (!raw) return null
    const entry: CacheEntry<T> = JSON.parse(raw)
    if (Date.now() - entry.timestamp > MAX_AGE_MS) return null
    return entry.data
  } catch {
    return null
  }
}

export function cacheGetStale<T>(key: string): T | null {
  // Returns data regardless of age — used for offline fallback
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}_${key}`)
    if (!raw) return null
    return JSON.parse(raw).data
  } catch {
    return null
  }
}

export function cacheClear(): void {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith(CACHE_KEY))
      .forEach(k => localStorage.removeItem(k))
  } catch { /* ignore */ }
}

export function cacheAge(key: string): number | null {
  // Returns age in ms, or null if no cache
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}_${key}`)
    if (!raw) return null
    return Date.now() - JSON.parse(raw).timestamp
  } catch {
    return null
  }
}
