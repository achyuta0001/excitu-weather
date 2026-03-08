import type { AQIData } from '@/types/weather'
import styles from './AQIPanel.module.css'

interface Props { aqi: AQIData }

export function AQIPanel({ aqi }: Props) {
  const pct = Math.min(aqi.aqi / 120, 1)

  return (
    <div className={styles.panel} style={{ '--aqi-color': aqi.color } as React.CSSProperties}>
      <div className={styles.header}>
        <span className={styles.label}>AIR QUALITY</span>
        <span className={styles.badge} style={{ color: aqi.color, borderColor: aqi.color + '44' }}>
          {aqi.label}
        </span>
      </div>

      {/* AQI bar */}
      <div className={styles.barTrack}>
        <div
          className={styles.barFill}
          style={{ width: `${pct * 100}%`, background: aqi.color, boxShadow: `0 0 10px ${aqi.color}` }}
        />
        <span className={styles.aqiNum}>{aqi.aqi}</span>
      </div>

      {/* Pollutant grid */}
      <div className={styles.grid}>
        <PollCell label="PM2.5" value={aqi.pm25} unit="µg" />
        <PollCell label="PM10"  value={aqi.pm10}  unit="µg" />
        <PollCell label="NO₂"  value={aqi.no2}   unit="µg" />
        <PollCell label="O₃"   value={aqi.o3}    unit="µg" />
      </div>
    </div>
  )
}

function PollCell({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className={styles.pollCell}>
      <span className={styles.pollLabel}>{label}</span>
      <span className={styles.pollValue}>{value}<span className={styles.pollUnit}>{unit}</span></span>
    </div>
  )
}
