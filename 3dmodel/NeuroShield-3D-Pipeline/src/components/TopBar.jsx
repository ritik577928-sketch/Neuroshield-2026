export default function TopBar({ pipeline }) {
  const { stages, stageIndex, goTo, dataMode, setDataMode } = pipeline
  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-title">NEUROSHIELD</div>
        <div className="brand-sub">Network Telemetry → Behavioral State → Future Intelligence</div>
      </div>

      <div className="stage-tracker">
        {stages.map((s, i) => (
          <button
            key={s.key}
            className={'stage-chip' + (i === stageIndex ? ' active' : '')}
            onClick={() => goTo(i)}
            aria-label={`Go to stage ${s.code} ${s.name}`}
          >
            {s.code.replace('b', '')} {s.short}
          </button>
        ))}
      </div>

      <div className="mode-toggle">
        <button
          className={dataMode === 'DEMO' ? 'active' : ''}
          onClick={() => setDataMode('DEMO')}
        >
          DEMO MODE
        </button>
        <button
          className={dataMode === 'REAL' ? 'active' : ''}
          onClick={() => setDataMode('REAL')}
        >
          REAL DATA MODE
        </button>
      </div>
    </div>
  )
}
