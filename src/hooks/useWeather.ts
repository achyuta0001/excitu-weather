import { useState, useCallback, useEffect, useRef } from 'react'
import type { AppState, WeatherData, ForecastDay, HourlyPoint, AQIData, WeatherAlert } from '@/types/weather'
import { getUserLocation } from '@/services/geoService'
import { fetchWeather, fetchForecast, fetchHourly } from '@/services/weatherService'
import { fetchAQI } from '@/services/aqiService'
import { cacheSet, cacheGet, cacheGetStale } from '@/services/cacheService'
import { deriveAlert } from '@/utils/alertUtils'

const AUTO_REFRESH_MS = 10 * 60 * 1000 // 10 minutes
const CACHE_KEY = 'all'

interface CachedBundle {
  data: WeatherData
  forecast: ForecastDay[]
  hourly: HourlyPoint[]
  aqi: AQIData
  alert: WeatherAlert
}

export function useWeather() {
  const [state, setState] = useState<AppState>({ status: 'idle' })
  const [nextRefresh, setNextRefresh] = useState<number>(0) // unix ms of next refresh
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async (silent = false) => {
    // If silent refresh, try cache first to avoid blank screen
    if (!silent) {
      const stale = cacheGetStale<CachedBundle>(CACHE_KEY)
      if (stale) {
        setState({ status: 'success', ...stale })
      } else {
        setState({ status: 'locating' })
      }
    }

    try {
      if (!silent && !cacheGetStale<CachedBundle>(CACHE_KEY)) {
        setState({ status: 'locating' })
      }

      const coords = await getUserLocation()

      if (!silent) setState({ status: 'loading' })

      // Check fresh cache first (< 10 min old)
      const cached = cacheGet<CachedBundle>(CACHE_KEY)
      if (cached) {
        setState({ status: 'success', ...cached })
        scheduleRefresh()
        return
      }

      const [data, forecast, hourly, aqi] = await Promise.all([
        fetchWeather(coords),
        fetchForecast(coords),
        fetchHourly(coords),
        fetchAQI(coords),
      ])

      const alert = deriveAlert(data, aqi)
      const bundle: CachedBundle = { data, forecast, hourly, aqi, alert }

      cacheSet(CACHE_KEY, bundle)
      setState({ status: 'success', ...bundle })
      scheduleRefresh()
    } catch (err) {
      // On error, try stale cache as fallback
      const stale = cacheGetStale<CachedBundle>(CACHE_KEY)
      if (stale) {
        setState({ status: 'success', ...stale })
        scheduleRefresh()
        return
      }
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong.',
      })
    }
  }, [])

  const scheduleRefresh = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const next = Date.now() + AUTO_REFRESH_MS
    setNextRefresh(next)
    timerRef.current = setTimeout(() => load(true), AUTO_REFRESH_MS)
  }, [load])

  // Hydrate from cache on mount instantly
  useEffect(() => {
    const stale = cacheGetStale<CachedBundle>(CACHE_KEY)
    if (stale) {
      setState({ status: 'success', ...stale })
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  return { state, load: () => load(false), nextRefresh }
}
