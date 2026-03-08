import type { WeatherData, ForecastDay, HourlyPoint, Coordinates } from '@/types/weather'
import { mapWmoToScene, wmoDescription } from '@/utils/sceneMapper'

// Open-Meteo — completely free, no API key required
// Docs: https://open-meteo.com/en/docs
const WEATHER_BASE = 'https://api.open-meteo.com/v1/forecast'
const GEO_BASE     = 'https://nominatim.openstreetmap.org/reverse'

// Resolve city + country from coordinates using OpenStreetMap Nominatim (also free, no key)
async function resolvePlaceName(lat: number, lon: number): Promise<{ city: string; country: string }> {
  try {
    const res = await fetch(
      `${GEO_BASE}?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    )
    if (!res.ok) return { city: 'Unknown', country: '' }
    const d = await res.json()
    const city =
      d.address?.city ||
      d.address?.town ||
      d.address?.village ||
      d.address?.county ||
      'Unknown'
    const country = d.address?.country_code?.toUpperCase() ?? ''
    return { city, country }
  } catch {
    return { city: 'Unknown', country: '' }
  }
}

export async function fetchWeather(coords: Coordinates): Promise<WeatherData> {
  const { lat, lon } = coords

  const params = new URLSearchParams({
    latitude:  String(lat),
    longitude: String(lon),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'wind_speed_10m',
      'wind_direction_10m',
      'surface_pressure',
      'visibility',
      'weather_code',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
    ].join(','),
    wind_speed_unit: 'kmh',
    forecast_days: '6',
    timezone: 'auto',
  })

  const [res, place] = await Promise.all([
    fetch(`${WEATHER_BASE}?${params}`),
    resolvePlaceName(lat, lon),
  ])

  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`)
  const d = await res.json()

  const c = d.current
  const wmo = c.weather_code
  const toUnix = (iso: string) => Math.floor(new Date(iso).getTime() / 1000)

  return {
    city:        place.city,
    country:     place.country,
    temp:        Math.round(c.temperature_2m),
    feelsLike:   Math.round(c.apparent_temperature),
    humidity:    c.relative_humidity_2m,
    windSpeed:   Math.round(c.wind_speed_10m),
    windDeg:     c.wind_direction_10m,
    pressure:    Math.round(c.surface_pressure),
    visibility:  Math.round((c.visibility ?? 10000) / 1000),
    description: wmoDescription(wmo),
    scene:       mapWmoToScene(wmo),
    icon:        String(wmo),
    sunrise:     toUnix(d.daily.sunrise[0]),
    sunset:      toUnix(d.daily.sunset[0]),
    timezone:    d.utc_offset_seconds,
  }
}

export async function fetchForecast(coords: Coordinates): Promise<ForecastDay[]> {
  const { lat, lon } = coords

  const params = new URLSearchParams({
    latitude:     String(lat),
    longitude:    String(lon),
    daily:        'weather_code,temperature_2m_max,temperature_2m_min',
    forecast_days: '6',
    timezone:     'auto',
  })

  const res = await fetch(`${WEATHER_BASE}?${params}`)
  if (!res.ok) throw new Error(`Open-Meteo forecast error: ${res.status}`)
  const d = await res.json()

  return d.daily.time
    .slice(1, 6)
    .map((dateStr: string, i: number) => ({
      date:        Math.floor(new Date(dateStr).getTime() / 1000),
      tempMin:     Math.round(d.daily.temperature_2m_min[i + 1]),
      tempMax:     Math.round(d.daily.temperature_2m_max[i + 1]),
      scene:       mapWmoToScene(d.daily.weather_code[i + 1]),
      description: wmoDescription(d.daily.weather_code[i + 1]),
    }))
}

export async function fetchHourly(coords: Coordinates): Promise<HourlyPoint[]> {
  const { lat, lon } = coords

  const params = new URLSearchParams({
    latitude:     String(lat),
    longitude:    String(lon),
    hourly:       'temperature_2m,precipitation,weather_code',
    forecast_days: '2',
    timezone:     'auto',
  })

  const res = await fetch(`${WEATHER_BASE}?${params}`)
  if (!res.ok) throw new Error(`Open-Meteo hourly error: ${res.status}`)
  const d = await res.json()

  // Return next 24 hours from current hour
  const now = Date.now()
  return d.hourly.time
    .map((t: string, i: number) => ({
      hour:          Math.floor(new Date(t).getTime() / 1000),
      temp:          Math.round(d.hourly.temperature_2m[i]),
      precipitation: d.hourly.precipitation[i] ?? 0,
      weatherCode:   d.hourly.weather_code[i],
    }))
    .filter((p: HourlyPoint) => p.hour * 1000 >= now - 3_600_000)
    .slice(0, 24)
}
