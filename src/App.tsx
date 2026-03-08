import { useEffect, useRef, useState } from 'react'
import { useWeather } from '@/hooks/useWeather'
import { CityCanvas } from '@/components/CityCanvas'
import { WeatherCanvas } from '@/components/WeatherCanvas'
import { WeatherDisplay } from '@/components/WeatherDisplay'
import { AlertBanner } from '@/components/AlertBanner'
import { LoadScreen } from '@/components/LoadScreen'
import { SCENE_CONFIGS } from '@/utils/sceneMapper'
import type { SceneType } from '@/types/weather'
import '@/styles/global.css'

export default function App() {
  const { state, load, nextRefresh } = useWeather()
  const [activeScene, setActiveScene] = useState<SceneType>('rain')
  const [transitioning, setTransitioning] = useState(false)
  const prevScene = useRef<SceneType>('rain')

  // Sync CSS variables + handle smooth scene transition
  useEffect(() => {
    if (state.status !== 'success') return
    const newScene = state.data.scene

    if (newScene !== prevScene.current) {
      setTransitioning(true)
      setTimeout(() => {
        setActiveScene(newScene)
        prevScene.current = newScene
        setTransitioning(false)
      }, 400)
    } else {
      setActiveScene(newScene)
    }

    const cfg = SCENE_CONFIGS[newScene]
    const root = document.documentElement
    root.style.setProperty('--accent',    cfg.accent)
    root.style.setProperty('--secondary', cfg.secondary)
    root.style.setProperty('--bg-from',   cfg.bgFrom)
    root.style.setProperty('--bg-to',     cfg.bgTo)
  }, [state])

  const showCanvas = state.status === 'success'
  const showLoad   = state.status !== 'success'

  return (
    <>
      {/* Layer 0: Cyberpunk city background */}
      <CityCanvas scene={activeScene} />

      {/* Layer 1: Weather particles (rain / snow / etc.) */}
      {showCanvas && (
        <div style={{
          opacity: transitioning ? 0 : 1,
          transition: 'opacity 0.4s ease',
        }}>
          <WeatherCanvas scene={activeScene} />
        </div>
      )}

      {/* Layer 2: HUD overlay */}
      {showCanvas && state.status === 'success' && (
        <div style={{
          opacity: transitioning ? 0 : 1,
          transition: 'opacity 0.4s ease',
        }}>
          <WeatherDisplay
            data={state.data}
            forecast={state.forecast}
            hourly={state.hourly}
            aqi={state.aqi}
            onRefresh={load}
            nextRefresh={nextRefresh}
          />
          <AlertBanner alert={state.alert} />
        </div>
      )}

      {/* Layer 3: Load / error screen */}
      {showLoad && <LoadScreen state={state} onLoad={load} />}
    </>
  )
}
