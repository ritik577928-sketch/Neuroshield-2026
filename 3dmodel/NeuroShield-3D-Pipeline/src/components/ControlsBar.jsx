export default function ControlsBar({ pipeline }) {
  const {
    playing, setPlaying,
    autoPlay, setAutoPlay,
    cameraMode, setCameraMode,
    speed, setSpeed,
    next, prev, reset, resetCamera,
  } = pipeline

  return (
    <div className="controls-bar">
      <button className="ctrl-btn" onClick={prev} aria-label="Previous stage">
        ◀ Prev
      </button>

      <button
        className={'ctrl-btn primary' + (playing ? ' active' : '')}
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? 'Pause animation' : 'Start animation'}
      >
        {playing ? '⏸ Pause' : '▶ Start'}
      </button>

      <button className="ctrl-btn" onClick={next} aria-label="Next stage">
        Next ▶
      </button>

      <div className="ctrl-sep" />

      <button
        className={'ctrl-btn' + (autoPlay ? ' active' : '')}
        onClick={() => setAutoPlay((a) => !a)}
        aria-label="Toggle autoplay through all stages"
      >
        ⟳ Auto Play
      </button>

      <button
        className={'ctrl-btn' + (cameraMode ? ' active' : '')}
        onClick={() => setCameraMode((c) => !c)}
        aria-label={cameraMode ? 'Switch to free camera' : 'Switch to cinematic camera'}
      >
        🎬 Camera Mode
      </button>

      <div className="speed-group" role="group" aria-label="Playback speed">
        {[0.5, 1, 2].map((s) => (
          <button
            key={s}
            className={'speed-btn' + (speed === s ? ' active' : '')}
            onClick={() => setSpeed(s)}
          >
            {s}x
          </button>
        ))}
      </div>

      <div className="ctrl-sep" />

      <button className="ctrl-btn" onClick={resetCamera} aria-label="Reset camera position">
        🎥 Reset View
      </button>
      <button className="ctrl-btn" onClick={reset} aria-label="Restart entire simulation">
        ⟲ Restart
      </button>
    </div>
  )
}
