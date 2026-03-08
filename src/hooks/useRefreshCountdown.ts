import { useState, useEffect } from 'react'

const AUTO_REFRESH_MS = 10 * 60 * 1000

export function useRefreshCountdown(nextRefresh: number) {
  const [pct, setPct] = useState(0) // 0 = just refreshed, 1 = about to refresh

  useEffect(() => {
    if (!nextRefresh) return
    const tick = () => {
      const remaining = nextRefresh - Date.now()
      const elapsed = AUTO_REFRESH_MS - remaining
      setPct(Math.min(Math.max(elapsed / AUTO_REFRESH_MS, 0), 1))
    }
    tick()
    const t = setInterval(tick, 5000)
    return () => clearInterval(t)
  }, [nextRefresh])

  return pct
}
