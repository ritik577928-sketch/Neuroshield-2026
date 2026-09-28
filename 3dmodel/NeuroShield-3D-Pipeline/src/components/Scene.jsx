import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, Stars, Environment, Lightformer, Text } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

import PipelinePath, {
  stagePosition,
  stageCameraOffset,
  FOCUS_Y_LIFT,
  ACTIVE_SIM_LIFT,
  ACTIVE_SIM_SCALE,
} from './PipelinePath.jsx'
import TrafficStage from './TrafficStage.jsx'
import CleaningStage from './CleaningStage.jsx'
import FeatureStage from './FeatureStage.jsx'
import WindowStage from './WindowStage.jsx'
import GraphStage from './GraphStage.jsx'
import GraphSAGEStage from './GraphSAGEStage.jsx'
import LSTMStage from './LSTMStage.jsx'
import WorldModelStage from './WorldModelStage.jsx'
import MitreStage from './MitreStage.jsx'

const STAGE_COMPONENTS = {
  traffic: TrafficStage,
  cleaning: CleaningStage,
  features: FeatureStage,
  windows: WindowStage,
  graph: GraphStage,
  graphsage: GraphSAGEStage,
  lstm: LSTMStage,
  worldmodel: WorldModelStage,
  mitre: MitreStage,
}

// How long (ms) after the user stops dragging before the cinematic camera
// resumes automatic framing.
const RESUME_CAMERA_MS = 4500

// Camera/target smoothing expressed as a time constant (seconds) rather than
// a fixed per-frame lerp factor, so transitions take a consistent ~1-2s to
// visually settle regardless of how far apart two stages are in the (now
// much more spacious) layout, and regardless of frame rate.
const CAMERA_TIME_CONSTANT = 0.45
const TARGET_TIME_CONSTANT = 0.5

export default function Scene({ pipeline }) {
  const {
    stage, stageIndex, stages, goTo,
    playing, speed, setSelectedNode, setSelectedFeature, cameraResetToken,
    cameraMode, userInteracting, setUserInteracting,
  } = pipeline

  const controlsRef = useRef()
  const { camera } = useThree()

  const focusTarget = useRef(new THREE.Vector3())
  const desiredCamPos = useRef(new THREE.Vector3())
  const resumeTimer = useRef(null)
  const orbitPhase = useRef(0)

  useEffect(() => {
    const [x, y, z] = stagePosition(stageIndex, stages.length)
    // Look slightly above the raw path anchor so the camera centers on the
    // simulation + name cluster rather than the low overview marker.
    focusTarget.current.set(x, y + FOCUS_Y_LIFT, z)
  }, [stageIndex, stages.length])

  const handleInteractStart = () => {
    setUserInteracting(true)
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
  }
  const handleInteractEnd = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => setUserInteracting(false), RESUME_CAMERA_MS)
  }

  useEffect(() => () => resumeTimer.current && clearTimeout(resumeTimer.current), [])

  useFrame((_, delta) => {
    if (!controlsRef.current) return

    // The orbit target always drifts toward the active stage so context is
    // preserved even while the user free-orbits. Exponential (delta-based)
    // smoothing keeps transition duration consistent no matter how large the
    // gap between two stages is.
    const targetAlpha = 1 - Math.exp(-delta / TARGET_TIME_CONSTANT)
    controlsRef.current.target.lerp(focusTarget.current, targetAlpha)

    if (cameraMode && !userInteracting) {
      orbitPhase.current += delta * 0.05 * speed
      const { dist, height } = stageCameraOffset(stageIndex)
      const angle = orbitPhase.current
      desiredCamPos.current.set(
        focusTarget.current.x + Math.sin(angle) * dist * 0.14 + dist * 0.55,
        focusTarget.current.y + height,
        focusTarget.current.z + Math.cos(angle) * dist * 0.14 + dist * 0.85
      )
      const camAlpha = 1 - Math.exp(-delta / CAMERA_TIME_CONSTANT)
      camera.position.lerp(desiredCamPos.current, camAlpha)
    }

    controlsRef.current.update()
  })

  useEffect(() => {
    if (cameraResetToken === 0) return
    const [x, , z] = stagePosition(stageIndex, stages.length)
    const { dist, height } = stageCameraOffset(stageIndex)
    camera.position.set(x + dist * 0.55, height + FOCUS_Y_LIFT, z + dist * 0.85)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraResetToken])

  const ActiveComponent = STAGE_COMPONENTS[stage.key]

  return (
    <>
      <color attach="background" args={['#04060a']} />
      <fog attach="fog" args={['#04060a', 22, 55]} />

      <ambientLight intensity={0.3} />
      <directionalLight position={[6, 10, 6]} intensity={0.85} color="#dfe9ff" />
      <pointLight position={[0, 3, 6]} intensity={0.7} color={stage.color} />
      <pointLight position={[-6, -2, -4]} intensity={0.25} color="#3346a8" />

      {/* Fully procedural environment map (no network fetch) so metallic/
          glass materials get subtle reflections and highlights even in an
          offline demo/presentation setting. */}
      <Environment resolution={128}>
        <Lightformer intensity={2.2} color="#38bdf8" position={[6, 4, -6]} scale={[6, 6, 1]} />
        <Lightformer intensity={1.6} color="#a78bfa" position={[-6, 3, 6]} scale={[6, 6, 1]} />
        <Lightformer intensity={0.9} color="#fb923c" position={[0, -4, 4]} scale={[8, 3, 1]} />
        <Lightformer intensity={1.2} color="#ffffff" position={[0, 8, 0]} scale={[10, 10, 1]} form="ring" />
      </Environment>

      <Stars radius={90} depth={40} count={1800} factor={2.2} fade speed={0.3} />

      <Grid
        position={[0, -3.2, 0]}
        args={[220, 220]}
        cellColor="#0f2033"
        sectionColor="#1c3a5e"
        fadeDistance={46}
        infiniteGrid
      />

      <PipelinePath stages={stages} stageIndex={stageIndex} onSelect={goTo} />

      {/* Active stage cluster: the simulation floats ABOVE the stage name,
          which sits ABOVE the small overview marker on the path below. */}
      <group position={stagePosition(stageIndex, stages.length)}>
        <group position={[0, ACTIVE_SIM_LIFT, 0]} scale={ACTIVE_SIM_SCALE}>
          {ActiveComponent && (
            <ActiveComponent
              playing={playing}
              speed={speed}
              onSelectNode={setSelectedNode}
              onSelectFeature={setSelectedFeature}
            />
          )}
        </group>

        <Text
          position={[0, 0.05, 0]}
          fontSize={0.44}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.03}
          outlineWidth={0.012}
          outlineColor="#04060a"
        >
          {stage.name}
        </Text>
        <Text
          position={[0, -0.38, 0]}
          fontSize={0.15}
          color="#9fb0c8"
          anchorX="center"
          anchorY="middle"
          maxWidth={5.5}
          textAlign="center"
        >
          {stage.code} · {stage.short}
        </Text>
      </group>

      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        minDistance={3}
        maxDistance={40}
        maxPolarAngle={Math.PI * 0.85}
        onStart={handleInteractStart}
        onEnd={handleInteractEnd}
      />

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.55} luminanceThreshold={0.32} luminanceSmoothing={0.25} mipmapBlur radius={0.6} />
        <Vignette eskil={false} offset={0.18} darkness={0.85} />
      </EffectComposer>
    </>
  )
}
