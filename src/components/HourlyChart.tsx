import { useEffect, useRef } from 'react'
import type { HourlyPoint } from '@/types/weather'
import styles from './HourlyChart.module.css'

interface Props {
  hourly: HourlyPoint[]
  accent: string
}

export function HourlyChart({ hourly, accent }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || hourly.length === 0) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    canvas.width = W * devicePixelRatio
    canvas.height = H * devicePixelRatio
    ctx.scale(devicePixelRatio, devicePixelRatio)

    const PAD = { top: 24, right: 12, bottom: 30, left: 36 }
    const chartW = W - PAD.left - PAD.right
    const chartH = H - PAD.top - PAD.bottom

    const temps  = hourly.map(p => p.temp)
    const precips = hourly.map(p => p.precipitation)
    const minT   = Math.min(...temps) - 2
    const maxT   = Math.max(...temps) + 2
    const maxP   = Math.max(...precips, 1)

    const tx = (i: number) => PAD.left + (i / (hourly.length - 1)) * chartW
    const ty = (t: number) => PAD.top + chartH - ((t - minT) / (maxT - minT)) * chartH
    const py = (p: number) => PAD.top + chartH - (p / maxP) * chartH * 0.4

    ctx.clearRect(0, 0, W, H)

    // Horizontal grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = PAD.top + (chartH / 4) * i
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke()
      const tVal = Math.round(maxT - ((maxT - minT) / 4) * i)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = `11px "Share Tech Mono"`
      ctx.textAlign = 'right'
      ctx.fillText(`${tVal}°`, PAD.left - 4, y + 4)
    }

    // Precipitation bars
    const barW = Math.max(2, chartW / hourly.length - 2)
    hourly.forEach((p, i) => {
      if (p.precipitation <= 0) return
      const x = tx(i) - barW / 2
      const barH = ((p.precipitation / maxP) * chartH * 0.35)
      const barGrad = ctx.createLinearGradient(0, PAD.top + chartH - barH, 0, PAD.top + chartH)
      barGrad.addColorStop(0, accent + '55')
      barGrad.addColorStop(1, accent + '11')
      ctx.fillStyle = barGrad
      ctx.fillRect(x, PAD.top + chartH - barH, barW, barH)
    })

    // Temperature area fill
    const areaGrad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + chartH)
    areaGrad.addColorStop(0, accent + '22')
    areaGrad.addColorStop(1, accent + '00')
    ctx.beginPath()
    ctx.moveTo(tx(0), PAD.top + chartH)
    hourly.forEach((p, i) => ctx.lineTo(tx(i), ty(p.temp)))
    ctx.lineTo(tx(hourly.length - 1), PAD.top + chartH)
    ctx.closePath()
    ctx.fillStyle = areaGrad
    ctx.fill()

    // Temperature line
    ctx.beginPath()
    ctx.strokeStyle = accent
    ctx.lineWidth = 1.5
    ctx.shadowBlur = 6
    ctx.shadowColor = accent
    hourly.forEach((p, i) => {
      i === 0 ? ctx.moveTo(tx(i), ty(p.temp)) : ctx.lineTo(tx(i), ty(p.temp))
    })
    ctx.stroke()
    ctx.shadowBlur = 0

    // Hour labels + dots every 4 hours
    hourly.forEach((p, i) => {
      if (i % 4 !== 0) return
      const x = tx(i)
      const d = new Date(p.hour * 1000)
      const h = d.getHours()
      const label = `${String(h).padStart(2, '0')}h`

      // Dot on line
      ctx.beginPath()
      ctx.arc(x, ty(p.temp), 2.5, 0, Math.PI * 2)
      ctx.fillStyle = accent
      ctx.shadowBlur = 8
      ctx.shadowColor = accent
      ctx.fill()
      ctx.shadowBlur = 0

      // Hour label
      ctx.fillStyle = 'rgba(255,255,255,0.55)'
      ctx.font = `11px "Share Tech Mono"`
      ctx.textAlign = 'center'
      ctx.fillText(label, x, H - 5)
    })

  }, [hourly, accent])

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.title}>24H FORECAST</span>
        <span className={styles.legend}>
          <span className={styles.legendDot} style={{ background: accent }} />TEMP
          <span className={styles.legendBar} style={{ background: accent + '55' }} />PRECIP
        </span>
      </div>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}
