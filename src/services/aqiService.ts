import type { AQIData, Coordinates } from '@/types/weather'

const AQI_BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality'

function classifyAQI(aqi: number): { label: string; color: string } {
  if (aqi <= 20)  return { label: 'PRISTINE',  color: '#00ff9f' }
  if (aqi <= 40)  return { label: 'CLEAN',     color: '#00e5ff' }
  if (aqi <= 60)  return { label: 'MODERATE',  color: '#f9c74f' }
  if (aqi <= 80)  return { label: 'DEGRADED',  color: '#f4a261' }
  if (aqi <= 100) return { label: 'HAZARDOUS', color: '#ff6b35' }
  return             { label: 'CRITICAL',  color: '#ff2d55' }
}

export async function fetchAQI(coords: Coordinates): Promise<AQIData> {
  const { lat, lon } = coords

  const params = new URLSearchParams({
    latitude:  String(lat),
    longitude: String(lon),
    current:   'european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone',
  })

  const res = await fetch(`${AQI_BASE}?${params}`)
  if (!res.ok) throw new Error(`AQI API error: ${res.status}`)
  const d = await res.json()

  const aqi = Math.round(d.current?.european_aqi ?? 0)
  const { label, color } = classifyAQI(aqi)

  return {
    aqi,
    pm25:  Math.round(d.current?.pm2_5 ?? 0),
    pm10:  Math.round(d.current?.pm10 ?? 0),
    no2:   Math.round(d.current?.nitrogen_dioxide ?? 0),
    o3:    Math.round(d.current?.ozone ?? 0),
    label,
    color,
  }
}
