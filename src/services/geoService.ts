import type { Coordinates } from '@/types/weather'

export function getUserLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by this browser'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      err => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            reject(new Error('Location access denied. Please enable location permissions.'))
            break
          case err.POSITION_UNAVAILABLE:
            reject(new Error('Location data unavailable.'))
            break
          case err.TIMEOUT:
            reject(new Error('Location request timed out.'))
            break
          default:
            reject(new Error('An unknown location error occurred.'))
        }
      },
      { timeout: 10000, maximumAge: 300000 }
    )
  })
}
