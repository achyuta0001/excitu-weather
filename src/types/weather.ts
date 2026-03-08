// Weather condition codes mapped to excitu scene types
export type SceneType =
  | 'clear'
  | 'clouds'
  | 'rain'
  | 'drizzle'
  | 'thunderstorm'
  | 'snow'
  | 'mist'
  | 'haze'
  | 'smoke'
  | 'dust'

export interface Coordinates {
  lat: number
  lon: number
}

export interface WeatherData {
  city: string
  country: string
  temp: number
  feelsLike: number
  humidity: number
  windSpeed: number
  windDeg: number
  pressure: number
  visibility: number
  description: string
  scene: SceneType
  icon: string
  sunrise: number
  sunset: number
  timezone: number
  uvi?: number
}

export interface ForecastDay {
  date: number
  tempMin: number
  tempMax: number
  scene: SceneType
  description: string
}

export interface HourlyPoint {
  hour: number        // unix timestamp
  temp: number
  precipitation: number   // mm
  weatherCode: number
}

export interface AQIData {
  aqi: number              // European AQI index 0–500
  pm25: number
  pm10: number
  no2: number
  o3: number
  label: string            // CLEAN / MODERATE / HAZARDOUS etc.
  color: string            // neon color for the label
}

export type AlertLevel = 'none' | 'advisory' | 'warning' | 'severe'

export interface WeatherAlert {
  level: AlertLevel
  title: string
  message: string
}

export type AppState =
  | { status: 'idle' }
  | { status: 'locating' }
  | { status: 'loading' }
  | { status: 'success'; data: WeatherData; forecast: ForecastDay[]; hourly: HourlyPoint[]; aqi: AQIData; alert: WeatherAlert }
  | { status: 'error'; message: string }
