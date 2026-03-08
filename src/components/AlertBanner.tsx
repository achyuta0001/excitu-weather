import { useState, useEffect, useRef } from 'react'
import type { WeatherAlert } from '@/types/weather'
import styles from './AlertBanner.module.css'

interface Props { alert: WeatherAlert }

const LEVEL_CONFIG = {
  none:     { color: 'transparent', icon: '' },
  advisory: { color: '#f9c74f',     icon: '◈' },
  warning:  { color: '#ff6b35',     icon: '⚠' },
  severe:   { color: '#ff2d55',     icon: '◉' },
}

export function AlertBanner({ alert }: Props) {
  const [visible, setVisible] = useState(false)
  // Track which alert key has been dismissed so dismiss survives re-renders
  const dismissedKey = useRef<string>('')
  const alertKey = `${alert.level}::${alert.title}`

  const isDismissed = dismissedKey.current === alertKey

  useEffect(() => {
    if (alert.level === 'none') { setVisible(false); return }
    // Only show if this alert hasn't been dismissed by the user
    if (dismissedKey.current === alertKey) return
    setVisible(false)
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [alertKey, alert.level])

  const handleDismiss = () => {
    dismissedKey.current = alertKey
    setVisible(false)
  }

  if (alert.level === 'none' || isDismissed) return null

  const cfg = LEVEL_CONFIG[alert.level]

  return (
    <div
      className={`${styles.banner} ${visible ? styles.visible : ''}`}
      style={{ '--alert-color': cfg.color } as React.CSSProperties}
    >
      <div className={styles.inner}>
        <span className={styles.icon} style={{ color: cfg.color }}>{cfg.icon}</span>
        <div className={styles.text}>
          <span className={styles.title}>{alert.title}</span>
          <span className={styles.message}>{alert.message}</span>
        </div>
        <button className={styles.dismiss} onClick={handleDismiss} aria-label="Dismiss alert">✕</button>
      </div>
      <div className={styles.progress} />
    </div>
  )
}
