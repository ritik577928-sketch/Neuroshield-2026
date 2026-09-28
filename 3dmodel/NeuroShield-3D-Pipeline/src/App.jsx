import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { usePipeline } from './hooks/usePipeline.js'
import Scene from './components/Scene.jsx'
import TopBar from './components/TopBar.jsx'
import InfoPanel from './components/InfoPanel.jsx'
import ControlsBar from './components/ControlsBar.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import ExplainabilityPanel from './components/ExplainabilityPanel.jsx'

export default function App() {
  const [entered, setEntered] = useState(false)
  const pipeline = usePipeline()

  // The cinematic simulation is meant to run with zero required interaction:
  // clicking "Enter" jumps straight in, but the intro also auto-dismisses on
  // its own after a short brand moment so a viewer who just opens the page
  // and steps back still sees the full pipeline explain itself.
  useEffect(() => {
    if (entered) return
    const timer = setTimeout(() => setEntered(true), 3200)
    return () => clearTimeout(timer)
  }, [entered])

  return (
    <div className="app-root">
      {!entered && (
        <div className="landing">
          <div className="landing-grid" />
          <h1>NEUROSHIELD</h1>
          <div className="subtitle">AI-Driven Network Behavior Model</div>
          <div className="tagline">
            From network telemetry to future attack intelligence — an interactive
            walkthrough of the full detection-to-prediction pipeline.
          </div>
          <button className="enter-btn" onClick={() => setEntered(true)}>
            ENTER PIPELINE
          </button>
        </div>
      )}

      {entered && (
        <>
          <Canvas
            camera={{ position: [0, 4, 13], fov: 50 }}
            gl={{ antialias: true }}
            dpr={[1, 1.6]}
          >
            <Scene pipeline={pipeline} />
          </Canvas>

          <TopBar pipeline={pipeline} />
          <InfoPanel pipeline={pipeline} />
          <DetailPanel pipeline={pipeline} />
          {pipeline.stage.key === 'worldmodel' && <ExplainabilityPanel />}
          <ControlsBar pipeline={pipeline} />
        </>
      )}
    </div>
  )
}
