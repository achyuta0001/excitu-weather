import { useState, useEffect } from 'react'
import { nowString } from '@/utils/format'

export function useClock() {
  const [time, setTime] = useState(nowString())
  useEffect(() => {
    const t = setInterval(() => setTime(nowString()), 1000)
    return () => clearInterval(t)
  }, [])
  return time
}
