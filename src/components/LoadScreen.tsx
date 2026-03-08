import styles from './LoadScreen.module.css'
import type { AppState } from '@/types/weather'

interface Props {
  state: AppState
  onLoad: () => void
}

const STATUS_LINES: Record<string, string> = {
  idle: '',
  locating: 'ACQUIRING COORDINATES...',
  loading: 'SYNCING ATMOSPHERIC DATA...',
}

export function LoadScreen({ state, onLoad }: Props) {
  const isIdle = state.status === 'idle'
  const isError = state.status === 'error'
  const isBusy = state.status === 'locating' || state.status === 'loading'

  return (
    <div className={styles.root}>
      <div className={styles.inner}>

        <div className={styles.logo}>
          <span className={styles.logoMark}>◈</span>
          <span className={styles.logoText}>excitu</span>
        </div>

        <p className={styles.tagline}>
          {isError ? (state as any).message : 'REAL-TIME ATMOSPHERIC INTELLIGENCE'}
        </p>

        {isBusy ? (
          <div className={styles.status}>
            <span className={styles.dot} />
            {STATUS_LINES[state.status]}
          </div>
        ) : (
          <button className={styles.btn} onClick={onLoad} disabled={isBusy}>
            {isError ? 'RETRY' : 'INITIALISE'}
          </button>
        )}

        <div className={styles.note}>
          {!isError && 'Location access required'}
        </div>
      </div>
    </div>
  )
}
