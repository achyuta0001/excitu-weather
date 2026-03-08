import type { SceneType } from '@/types/weather'

// ── WMO Weather Interpretation Codes (used by Open-Meteo) ──────────────────
// Full spec: https://open-meteo.com/en/docs#weathervariables
export function mapWmoToScene(code: number): SceneType {
  if (code === 0)                         return 'clear'       // Clear sky
  if (code <= 2)                          return 'clear'       // Mainly clear, partly cloudy
  if (code === 3)                         return 'clouds'      // Overcast
  if (code >= 45 && code <= 48)          return 'mist'        // Fog / depositing rime fog
  if (code >= 51 && code <= 57)          return 'drizzle'     // Drizzle (light→dense, freezing)
  if (code >= 61 && code <= 67)          return 'rain'        // Rain (slight→heavy, freezing)
  if (code >= 71 && code <= 77)          return 'snow'        // Snow / snow grains / ice crystals
  if (code >= 80 && code <= 82)          return 'rain'        // Rain showers
  if (code === 85 || code === 86)        return 'snow'        // Snow showers
  if (code >= 95 && code <= 99)          return 'thunderstorm' // Thunderstorm ± hail
  return 'clear'
}

// Human-readable description for WMO codes
export function wmoDescription(code: number): string {
  const map: Record<number, string> = {
    0:  'clear sky',
    1:  'mainly clear',    2: 'partly cloudy',     3: 'overcast',
    45: 'fog',             48: 'rime fog',
    51: 'light drizzle',   53: 'drizzle',           55: 'dense drizzle',
    56: 'freezing drizzle',57: 'heavy freezing drizzle',
    61: 'slight rain',     63: 'rain',              65: 'heavy rain',
    66: 'freezing rain',   67: 'heavy freezing rain',
    71: 'slight snow',     73: 'snow',              75: 'heavy snow',
    77: 'snow grains',
    80: 'slight showers',  81: 'showers',           82: 'violent showers',
    85: 'snow showers',    86: 'heavy snow showers',
    95: 'thunderstorm',    96: 'thunderstorm w/ hail', 99: 'severe thunderstorm',
  }
  return map[code] ?? 'unknown'
}

// Legacy OWM mapper — kept for reference
export function mapConditionToScene(code: number): SceneType {
  if (code >= 200 && code < 300) return 'thunderstorm'
  if (code >= 300 && code < 400) return 'drizzle'
  if (code >= 500 && code < 600) return 'rain'
  if (code >= 600 && code < 700) return 'snow'
  if (code === 701 || code === 741) return 'mist'
  if (code === 721 || code === 731) return 'haze'
  if (code === 711 || code === 761 || code === 762) return 'smoke'
  if (code >= 700 && code < 800) return 'dust'
  if (code === 800) return 'clear'
  if (code >= 801 && code < 900) return 'clouds'
  return 'clear'
}

export interface SceneConfig {
  label: string
  accent: string       // primary neon color
  secondary: string    // secondary glow
  bgFrom: string
  bgTo: string
  particle: 'rain' | 'snow' | 'static' | 'ember' | 'none'
}

export const SCENE_CONFIGS: Record<SceneType, SceneConfig> = {
  clear: {
    label: 'CLEAR',
    accent: '#f9c74f',
    secondary: '#f4a261',
    bgFrom: '#0a0800',
    bgTo: '#1a1200',
    particle: 'none',
  },
  clouds: {
    label: 'OVERCAST',
    accent: '#90e0ef',
    secondary: '#48cae4',
    bgFrom: '#030810',
    bgTo: '#060d18',
    particle: 'static',
  },
  rain: {
    label: 'RAIN',
    accent: '#00b4d8',
    secondary: '#0077b6',
    bgFrom: '#00080f',
    bgTo: '#000d18',
    particle: 'rain',
  },
  drizzle: {
    label: 'DRIZZLE',
    accent: '#48cae4',
    secondary: '#90e0ef',
    bgFrom: '#010810',
    bgTo: '#050d18',
    particle: 'rain',
  },
  thunderstorm: {
    label: 'STORM',
    accent: '#7b2fff',
    secondary: '#c77dff',
    bgFrom: '#040008',
    bgTo: '#080010',
    particle: 'rain',
  },
  snow: {
    label: 'SNOW',
    accent: '#caf0f8',
    secondary: '#90e0ef',
    bgFrom: '#020508',
    bgTo: '#050a10',
    particle: 'snow',
  },
  mist: {
    label: 'MIST',
    accent: '#a8dadc',
    secondary: '#457b9d',
    bgFrom: '#020608',
    bgTo: '#040a0e',
    particle: 'static',
  },
  haze: {
    label: 'HAZE',
    accent: '#e9c46a',
    secondary: '#f4a261',
    bgFrom: '#080500',
    bgTo: '#0f0800',
    particle: 'static',
  },
  smoke: {
    label: 'SMOKE',
    accent: '#adb5bd',
    secondary: '#6c757d',
    bgFrom: '#040404',
    bgTo: '#080808',
    particle: 'ember',
  },
  dust: {
    label: 'DUST',
    accent: '#e07a5f',
    secondary: '#f2cc8f',
    bgFrom: '#080200',
    bgTo: '#100400',
    particle: 'ember',
  },
}
