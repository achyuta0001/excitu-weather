import { useEffect, useRef } from 'react'
import type { SceneType } from '@/types/weather'
import { SCENE_CONFIGS } from '@/utils/sceneMapper'
import styles from './WeatherCanvas.module.css'

interface Props {
  scene: SceneType
}

interface Particle {
  x: number; y: number; vx: number; vy: number
  size: number; opacity: number; life: number; maxLife: number
}

function createRainParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w * 1.5 - w * 0.25,
    y: -20,
    vx: 0.4 + Math.random() * 0.3,
    vy: 14 + Math.random() * 10,
    size: 0.5 + Math.random() * 1,
    opacity: 0.15 + Math.random() * 0.5,
    life: 0, maxLife: 1,
  }
}

function createSnowParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: -10,
    vx: (Math.random() - 0.5) * 1.2,
    vy: 0.8 + Math.random() * 1.5,
    size: 1 + Math.random() * 2.5,
    opacity: 0.3 + Math.random() * 0.6,
    life: 0, maxLife: 1,
  }
}

function createEmberParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: h + 10,
    vx: (Math.random() - 0.5) * 2,
    vy: -(0.5 + Math.random() * 2),
    size: 1 + Math.random() * 2,
    opacity: 0.2 + Math.random() * 0.6,
    life: 0, maxLife: 1,
  }
}

function createStaticParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    size: 0.5 + Math.random() * 1.5,
    opacity: 0.05 + Math.random() * 0.2,
    life: Math.random(), maxLife: 1,
  }
}

export function WeatherCanvas({ scene }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const config = SCENE_CONFIGS[scene]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let W = canvas.offsetWidth
    let H = canvas.offsetHeight
    canvas.width = W
    canvas.height = H

    const resize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight
      canvas.width = W; canvas.height = H
    }
    window.addEventListener('resize', resize)

    const particleType = config.particle
    const particles: Particle[] = []
    const MAX = particleType === 'rain' ? 180 : particleType === 'snow' ? 120 : particleType === 'ember' ? 80 : 60

    const spawn = () => {
      if (particleType === 'rain') return createRainParticle(W, H)
      if (particleType === 'snow') return createSnowParticle(W, H)
      if (particleType === 'ember') return createEmberParticle(W, H)
      return createStaticParticle(W, H)
    }

    for (let i = 0; i < MAX; i++) {
      const p = spawn()
      // spread initial positions vertically
      if (particleType === 'rain' || particleType === 'snow') p.y = Math.random() * H
      particles.push(p)
    }

    // Lightning state for thunderstorm
    let lightningAlpha = 0
    let nextLightning = 2000 + Math.random() * 4000
    let elapsed = 0

    let raf: number
    let last = performance.now()

    const draw = (now: number) => {
      const dt = Math.min(now - last, 50)
      last = now
      elapsed += dt

      // Transparent — city canvas is behind this
      ctx.clearRect(0, 0, W, H)

      // Lightning flash for thunderstorm
      if (scene === 'thunderstorm') {
        if (elapsed > nextLightning) {
          lightningAlpha = 0.15 + Math.random() * 0.25
          nextLightning = elapsed + 3000 + Math.random() * 5000
        }
        if (lightningAlpha > 0) {
          // Draw lightning bolt
          ctx.save()
          ctx.strokeStyle = `rgba(180, 130, 255, ${lightningAlpha})`
          ctx.lineWidth = 2
          ctx.shadowBlur = 20
          ctx.shadowColor = '#7b2fff'
          ctx.beginPath()
          const lx = W * 0.3 + Math.random() * W * 0.4
          ctx.moveTo(lx, 0)
          let cx = lx, cy = 0
          while (cy < H * 0.7) {
            cx += (Math.random() - 0.5) * 80
            cy += 40 + Math.random() * 60
            ctx.lineTo(cx, cy)
          }
          ctx.stroke()
          ctx.restore()
          // Screen flash
          ctx.fillStyle = `rgba(120, 80, 255, ${lightningAlpha * 0.12})`
          ctx.fillRect(0, 0, W, H)
          lightningAlpha *= 0.85
        }
      }

      // Draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx * (dt / 16)
        p.y += p.vy * (dt / 16)
        p.life += dt / 16

        let dead = false
        if (particleType === 'rain' && (p.y > H + 20 || p.x > W + 20)) dead = true
        if (particleType === 'snow' && p.y > H + 10) dead = true
        if (particleType === 'ember' && p.y < -10) dead = true
        if (particleType === 'static') {
          // Fade in/out
          p.opacity = 0.05 + Math.sin(p.life * 0.04) * 0.15
          if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) dead = true
        }

        if (dead) {
          particles[i] = spawn()
          if (particleType === 'rain' || particleType === 'snow') { /* keep at top */ }
          continue
        }

        ctx.save()
        ctx.globalAlpha = p.opacity

        if (particleType === 'rain') {
          ctx.strokeStyle = config.accent
          ctx.lineWidth = p.size
          ctx.shadowBlur = 4
          ctx.shadowColor = config.accent
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3)
          ctx.stroke()
        } else if (particleType === 'snow') {
          ctx.fillStyle = config.accent
          ctx.shadowBlur = 6
          ctx.shadowColor = config.accent
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        } else if (particleType === 'ember') {
          const flicker = 0.5 + Math.sin(p.life * 0.3) * 0.5
          ctx.fillStyle = config.accent
          ctx.shadowBlur = 8
          ctx.shadowColor = config.secondary
          ctx.globalAlpha = p.opacity * flicker
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillStyle = config.accent
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [scene])

  return <canvas ref={canvasRef} className={styles.canvas} />
}
