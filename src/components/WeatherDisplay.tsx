import type { WeatherData, ForecastDay, HourlyPoint, AQIData } from '@/types/weather'
import { SCENE_CONFIGS } from '@/utils/sceneMapper'
import { formatTime, windDirection, dayName } from '@/utils/format'
import { useClock } from '@/hooks/useClock'
import { useRefreshCountdown } from '@/hooks/useRefreshCountdown'
import { AQIPanel } from './AQIPanel'
import { HourlyChart } from './HourlyChart'
import styles from './WeatherDisplay.module.css'

interface Props {
  data: WeatherData
  forecast: ForecastDay[]
  hourly: HourlyPoint[]
  aqi: AQIData
  onRefresh: () => void
  nextRefresh: number
}

const RING_R = 10
const RING_CIRC = 2 * Math.PI * RING_R

export function WeatherDisplay({ data, forecast, hourly, aqi, onRefresh, nextRefresh }: Props) {
  const config = SCENE_CONFIGS[data.scene]
  const time = useClock()
  const refreshPct = useRefreshCountdown(nextRefresh)

  const accentStyle = {
    '--accent': config.accent,
    '--secondary': config.secondary,
  } as React.CSSProperties

  const ringOffset = RING_CIRC * (1 - refreshPct)

  return (
    <div className={styles.root} style={accentStyle}>

      {/* Top bar */}
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>◈</span>
          <span className={styles.brandName}>excitu</span>
        </div>
        <div className={styles.clock}>{time}</div>
        <button className={styles.refreshBtn} onClick={onRefresh} title="Refresh">
          <svg width="24" height="24" viewBox="0 0 24 24" className={styles.refreshSvg}>
            <circle
              cx="12" cy="12" r={RING_R}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1.5"
            />
            <circle
              cx="12" cy="12" r={RING_R}
              fill="none"
              stroke={config.accent}
              strokeWidth="1.5"
              strokeDasharray={RING_CIRC}
              strokeDashoffset={ringOffset}
              strokeLinecap="round"
              transform="rotate(-90 12 12)"
              style={{ transition: 'stroke-dashoffset 5s linear', filter: `drop-shadow(0 0 3px ${config.accent})` }}
            />
            <text x="12" y="15.5" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)" fontFamily="sans-serif">↺</text>
          </svg>
        </button>
      </header>

      {/* Main centrepiece */}
      <main className={styles.main}>
        <div className={styles.location}>
          <span className={styles.locationPin}>⌖</span>
          {data.city}, {data.country}
        </div>

        <div className={styles.tempBlock}>
          <span className={styles.temp}>{data.temp}</span>
          <span className={styles.tempUnit}>°C</span>
        </div>

        <div className={styles.conditionLabel}>{config.label}</div>
        <div className={styles.description}>{data.description.toUpperCase()}</div>
        <div className={styles.feelsLike}>FEELS LIKE {data.feelsLike}°</div>
      </main>

      {/* Stats row */}
      <section className={styles.statsRow}>
        <StatCell label="HUMIDITY"   value={`${data.humidity}%`} />
        <div className={styles.divider} />
        <StatCell label="WIND"       value={`${data.windSpeed} km/h ${windDirection(data.windDeg)}`} />
        <div className={styles.divider} />
        <StatCell label="VISIBILITY" value={`${data.visibility} km`} />
        <div className={styles.divider} />
        <StatCell label="PRESSURE"   value={`${data.pressure} hPa`} />
        <div className={styles.divider} />
        <StatCell label="SUNRISE"    value={formatTime(data.sunrise, data.timezone)} />
        <div className={styles.divider} />
        <StatCell label="SUNSET"     value={formatTime(data.sunset, data.timezone)} />
      </section>

      {/* Bottom panels row */}
      <div className={styles.bottomPanels}>

        {/* Left: forecast + AQI */}
        <div className={styles.leftPanels}>
          <section className={styles.forecast}>
            {forecast.map((f) => {
              const fc = SCENE_CONFIGS[f.scene]
              return (
                <div key={f.date} className={styles.forecastCard}>
                  <span className={styles.forecastDay}>{dayName(f.date)}</span>
                  <span className={styles.forecastDot} style={{ background: fc.accent, boxShadow: `0 0 8px ${fc.accent}` }} />
                  <span className={styles.forecastHigh}>{f.tempMax}°</span>
                  <span className={styles.forecastLow}>{f.tempMin}°</span>
                </div>
              )
            })}
          </section>
          <AQIPanel aqi={aqi} />
        </div>

        {/* Right: hourly chart */}
        <div className={styles.rightPanel}>
          <HourlyChart hourly={hourly} accent={config.accent} />
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <span className={styles.footerDot} />
        <span>LIVE · OPEN-METEO + OSM</span>
        <span className={styles.footerSep}>|</span>
        <span>{data.city.toUpperCase()} SECTOR</span>
        <span className={styles.footerSep}>|</span>
        <span>AUTO-SYNC 10 MIN</span>
      </footer>

    </div>
  )
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.statCell}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  )
}

