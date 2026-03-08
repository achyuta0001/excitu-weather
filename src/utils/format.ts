export function formatTime(unix: number, timezone: number): string {
  const d = new Date((unix + timezone) * 1000)
  const h = String(d.getUTCHours()).padStart(2, '0')
  const m = String(d.getUTCMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export function windDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}

export function dayName(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
}

export function nowString(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  })
}
