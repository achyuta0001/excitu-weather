import type { WeatherData, AQIData, WeatherAlert } from '@/types/weather'

export function deriveAlert(data: WeatherData, aqi: AQIData): WeatherAlert {
  const scene = data.scene

  // Severe weather alerts
  if (scene === 'thunderstorm') {
    return {
      level: 'severe',
      title: 'STORM ALERT',
      message: 'Severe electrical storm detected. Seek shelter immediately.',
    }
  }

  if (aqi.aqi > 100) {
    return {
      level: 'severe',
      title: 'AIR HAZARD',
      message: `Atmospheric toxicity critical — AQI ${aqi.aqi}. Respiratory protection advised.`,
    }
  }

  if (data.windSpeed > 80) {
    return {
      level: 'severe',
      title: 'GALE FORCE',
      message: `Wind velocity ${data.windSpeed} km/h. Structural risk elevated.`,
    }
  }

  // Warnings
  if (scene === 'snow' && data.temp < -10) {
    return {
      level: 'warning',
      title: 'CRYO WARNING',
      message: `Temperature ${data.temp}°C. Hypothermia risk active. Thermal gear required.`,
    }
  }

  if (scene === 'rain' || scene === 'drizzle') {
    if (data.visibility < 2) {
      return {
        level: 'warning',
        title: 'LOW VIZ',
        message: `Visibility reduced to ${data.visibility} km. Navigate with caution.`,
      }
    }
  }

  if (aqi.aqi > 60) {
    return {
      level: 'warning',
      title: 'AIR ADVISORY',
      message: `Particulate levels elevated — AQI ${aqi.aqi}. Limit prolonged outdoor exposure.`,
    }
  }

  if (data.windSpeed > 50) {
    return {
      level: 'advisory',
      title: 'WIND ADVISORY',
      message: `Sustained winds at ${data.windSpeed} km/h. Secure loose objects.`,
    }
  }

  if (scene === 'smoke' || scene === 'dust' || scene === 'haze') {
    return {
      level: 'advisory',
      title: 'PARTICULATE HAZE',
      message: 'Reduced air clarity detected. Eye and respiratory irritation possible.',
    }
  }

  return { level: 'none', title: '', message: '' }
}
