import { useEffect, useRef } from 'react'
import type { SceneType } from '@/types/weather'
import { SCENE_CONFIGS } from '@/utils/sceneMapper'
import styles from './CityCanvas.module.css'

interface Props { scene: SceneType }

interface Building {
  x: number; w: number; h: number
  layer: number // 0=far, 1=mid, 2=near
  windows: Window[]
  hasAntenna: boolean
  hasSign: boolean
  signColor: string
  signW: number
}

interface Window {
  x: number; y: number; w: number; h: number; lit: boolean; color: string
}

interface Vehicle {
  x: number; y: number; vx: number; size: number; color: string; trail: number
}

function generateBuildings(W: number, H: number, accent: string, secondary: string): Building[] {
  const buildings: Building[] = []
  const neonPalette = [accent, secondary, '#ff2d55', '#00ff9f', '#f9c74f', '#7b2fff']

  // Far layer (dim, small)
  for (let x = -20; x < W + 20; x += 18 + Math.random() * 22) {
    const w = 14 + Math.random() * 28
    const h = H * 0.18 + Math.random() * H * 0.22
    buildings.push({
      x, w, h, layer: 0,
      windows: generateWindows(w, h, 0.3, neonPalette),
      hasAntenna: Math.random() > 0.6,
      hasSign: false,
      signColor: '',
      signW: 0,
    })
  }

  // Mid layer
  for (let x = -10; x < W + 10; x += 28 + Math.random() * 36) {
    const w = 22 + Math.random() * 44
    const h = H * 0.28 + Math.random() * H * 0.32
    const signColor = neonPalette[Math.floor(Math.random() * neonPalette.length)]
    buildings.push({
      x, w, h, layer: 1,
      windows: generateWindows(w, h, 0.5, neonPalette),
      hasAntenna: Math.random() > 0.5,
      hasSign: Math.random() > 0.55,
      signColor,
      signW: 10 + Math.random() * 20,
    })
  }

  // Near layer (large, detailed)
  for (let x = -20; x < W + 20; x += 44 + Math.random() * 56) {
    const w = 36 + Math.random() * 64
    const h = H * 0.35 + Math.random() * H * 0.35
    const signColor = neonPalette[Math.floor(Math.random() * neonPalette.length)]
    buildings.push({
      x, w, h, layer: 2,
      windows: generateWindows(w, h, 0.65, neonPalette),
      hasAntenna: Math.random() > 0.4,
      hasSign: Math.random() > 0.4,
      signColor,
      signW: 16 + Math.random() * 30,
    })
  }

  return buildings
}

function generateWindows(bw: number, bh: number, litChance: number, palette: string[]): Window[] {
  const wins: Window[] = []
  const cols = Math.floor(bw / 8)
  const rows = Math.floor(bh / 10)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      wins.push({
        x: 3 + c * 8,
        y: 4 + r * 10,
        w: 4, h: 5,
        lit: Math.random() < litChance,
        color: palette[Math.floor(Math.random() * palette.length)],
      })
    }
  }
  return wins
}

export function CityCanvas({ scene }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cfg = SCENE_CONFIGS[scene]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let W = canvas.offsetWidth
    let H = canvas.offsetHeight
    canvas.width = W
    canvas.height = H

    const onResize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight
      canvas.width = W; canvas.height = H
      buildings = generateBuildings(W, H, cfg.accent, cfg.secondary)
    }
    window.addEventListener('resize', onResize)

    let buildings = generateBuildings(W, H, cfg.accent, cfg.secondary)

    // Flying vehicles — 3 subtle ones
    const vehicles: Vehicle[] = Array.from({ length: 3 }, () => ({
      x: Math.random() * W,
      y: H * 0.15 + Math.random() * H * 0.35,
      vx: (0.3 + Math.random() * 0.8) * (Math.random() > 0.5 ? 1 : -1),
      size: 2 + Math.random() * 3,
      color: [cfg.accent, cfg.secondary, '#ff2d55'][Math.floor(Math.random() * 3)],
      trail: 20 + Math.random() * 30,
    }))

    // Flicker state for windows
    const flickerTimers = new Map<string, number>()
    let lastFlicker = 0

    let raf: number
    let frame = 0

    const draw = (now: number) => {
      frame++
      ctx.clearRect(0, 0, W, H)

      // Very deep sky — almost pure black with a faint tint
      const sky = ctx.createLinearGradient(0, 0, 0, H)
      sky.addColorStop(0,   '#000000')
      sky.addColorStop(0.5, cfg.bgFrom + 'cc')
      sky.addColorStop(1,   '#000000')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, H)

      // Horizon glow — subtle, only near the city line
      const horizonY = H * 0.66
      const glow = ctx.createRadialGradient(W / 2, horizonY, 0, W / 2, horizonY, W * 0.55)
      glow.addColorStop(0,   cfg.accent + '0c')
      glow.addColorStop(0.5, cfg.secondary + '05')
      glow.addColorStop(1,   'transparent')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, W, H)

      // Occasionally flicker windows
      if (now - lastFlicker > 300) {
        lastFlicker = now
        buildings.forEach((b, bi) => {
          b.windows.forEach((w, wi) => {
            if (Math.random() < 0.002) {
              w.lit = !w.lit
            }
          })
        })
      }

      // Draw buildings by layer (far → near)
      for (const layer of [0, 1, 2]) {
        const layerBuildings = buildings.filter(b => b.layer === layer)
        // Much lower dim factors — buildings are very dark silhouettes
        const dimFactor = layer === 0 ? 0.06 : layer === 1 ? 0.14 : 0.28
        const baseY = layer === 0 ? H * 0.76 : layer === 1 ? H * 0.72 : H * 0.66

        for (const b of layerBuildings) {
          const bTop = baseY - b.h
          const bBottom = H

          // Building silhouette — near-black
          ctx.fillStyle = layer === 0
            ? 'rgba(3, 5, 8, 0.96)'
            : layer === 1
            ? 'rgba(4, 6, 10, 0.97)'
            : 'rgba(2, 4, 8, 0.98)'
          ctx.fillRect(b.x, bTop, b.w, bBottom - bTop)

          // Very faint top edge
          ctx.strokeStyle = cfg.accent + '12'
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(b.x, bTop)
          ctx.lineTo(b.x + b.w, bTop)
          ctx.stroke()

          // Windows — sparse, dim
          for (const win of b.windows) {
            if (!win.lit) continue
            // Only draw a fraction of windows per layer for sparseness
            const alpha = Math.round(dimFactor * 160 + 20)
            ctx.fillStyle = win.color + alpha.toString(16).padStart(2, '0')
            ctx.shadowBlur = layer === 2 ? 3 : 1
            ctx.shadowColor = win.color + '44'
            ctx.fillRect(b.x + win.x, bTop + win.y, win.w, win.h)
            ctx.shadowBlur = 0
          }

          // Antenna — only on near layer
          if (b.hasAntenna && layer === 2) {
            const ax = b.x + b.w / 2
            ctx.strokeStyle = cfg.accent + '20'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(ax, bTop)
            ctx.lineTo(ax, bTop - 14)
            ctx.stroke()
            // blinking beacon
            if (Math.floor(now / 1200) % 2 === 0) {
              ctx.fillStyle = '#ff2d55'
              ctx.shadowBlur = 5
              ctx.shadowColor = '#ff2d55'
              ctx.globalAlpha = 0.5
              ctx.beginPath()
              ctx.arc(ax, bTop - 14, 1.2, 0, Math.PI * 2)
              ctx.fill()
              ctx.globalAlpha = 1
              ctx.shadowBlur = 0
            }
          }

          // Neon sign — only near layer, very subtle
          if (b.hasSign && layer === 2) {
            const sx = b.x + (b.w - b.signW) / 2
            const sy = bTop + b.h * 0.18
            const pulse = 0.4 + Math.sin(now * 0.0015 + b.x) * 0.2
            ctx.fillStyle = b.signColor
            ctx.shadowBlur = 4
            ctx.shadowColor = b.signColor
            ctx.globalAlpha = pulse * 0.35
            ctx.fillRect(sx, sy, b.signW, 2)
            ctx.globalAlpha = 1
            ctx.shadowBlur = 0
          }
        }
      }

      // Ground strip — faint neon bleed at the very bottom
      const ground = ctx.createLinearGradient(0, H * 0.92, 0, H)
      ground.addColorStop(0, cfg.accent + '00')
      ground.addColorStop(1, cfg.accent + '0d')
      ctx.fillStyle = ground
      ctx.fillRect(0, H * 0.92, W, H * 0.08)

      // Flying vehicles — only 3, very subtle
      for (const v of vehicles) {
        v.x += v.vx
        if (v.x > W + 60) v.x = -60
        if (v.x < -60) v.x = W + 60

        const trailGrad = ctx.createLinearGradient(
          v.x - v.trail * Math.sign(v.vx), v.y,
          v.x, v.y
        )
        trailGrad.addColorStop(0, v.color + '00')
        trailGrad.addColorStop(1, v.color + '30')
        ctx.fillStyle = trailGrad
        ctx.globalAlpha = 0.5
        ctx.fillRect(v.x - v.trail * Math.sign(v.vx), v.y - 0.5, v.trail, 1)
        ctx.globalAlpha = 1

        ctx.fillStyle = v.color
        ctx.shadowBlur = 5
        ctx.shadowColor = v.color
        ctx.globalAlpha = 0.6
        ctx.beginPath()
        ctx.arc(v.x, v.y, v.size * 0.7, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
      }

      // Heavy vignette — pulls edges to pure black, foreground text pops
      const vig = ctx.createRadialGradient(W * 0.5, H * 0.45, H * 0.1, W * 0.5, H * 0.5, H * 0.9)
      vig.addColorStop(0,   'rgba(0,0,0,0)')
      vig.addColorStop(0.5, 'rgba(0,0,0,0.3)')
      vig.addColorStop(1,   'rgba(0,0,0,0.88)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, W, H)

      // Top gradient to ensure header text is always readable
      const topFade = ctx.createLinearGradient(0, 0, 0, H * 0.18)
      topFade.addColorStop(0,   'rgba(0,0,0,0.65)')
      topFade.addColorStop(1,   'rgba(0,0,0,0)')
      ctx.fillStyle = topFade
      ctx.fillRect(0, 0, W, H * 0.18)

      // Bottom gradient for footer readability
      const botFade = ctx.createLinearGradient(0, H * 0.82, 0, H)
      botFade.addColorStop(0,   'rgba(0,0,0,0)')
      botFade.addColorStop(1,   'rgba(0,0,0,0.7)')
      ctx.fillStyle = botFade
      ctx.fillRect(0, H * 0.82, W, H * 0.18)

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [scene])

  return <canvas ref={canvasRef} className={styles.canvas} />
}
