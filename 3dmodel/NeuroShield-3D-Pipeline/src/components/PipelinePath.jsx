import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

// Lays the 9 stages out along a gentle 3D arc so it reads as a path rather
// than a flat vertical list. Gap is generous (each stage gets its own zone)
// so neighboring stages' models, labels, and particle simulations never
// collide even once individual stages are scaled up.
const STAGE_GAP = 20
const PATH_LENGTH = STAGE_GAP * 8 // 9 stages -> 8 gaps

export function stagePosition(index, total) {
  const t = index / (total - 1)
  const x = (t - 0.5) * PATH_LENGTH
  const z = Math.sin(t * Math.PI) * -5.5
  const y = Math.sin(t * Math.PI * 2) * 1.0
  return [x, y, z]
}

// Vertical offset applied to a stage's orbit-target/camera focus so the
// camera centers on the visual cluster (simulation + name), not just the
// low path marker.
export const FOCUS_Y_LIFT = 1.9

// How far the simulation content is lifted above its stage anchor, and how
// much larger the "hero" models are scaled, so simulation sits clearly
// above the stage name with no overlap.
export const ACTIVE_SIM_LIFT = 3.0
export const ACTIVE_SIM_SCALE = 1.15

// A cinematic camera offset per stage, relative to that stage's focus point.
// Wider/busier or taller stages (features, windows, graph, LSTM) get pulled
// back further so the whole simulation + label stack fits in frame.
const STAGE_CAMERA_DISTANCE = [11, 10.5, 15, 14, 15.5, 12.5, 14.5, 14.5, 14]
const STAGE_CAMERA_HEIGHT = [3.2, 3.0, 3.6, 3.0, 4.0, 3.2, 3.2, 3.6, 3.2]

export function stageCameraOffset(index) {
  const dist = STAGE_CAMERA_DISTANCE[index] ?? 13
  const height = STAGE_CAMERA_HEIGHT[index] ?? 3.2
  return { dist, height }
}

export default function PipelinePath({ stages, stageIndex, onSelect }) {
  return (
    <group>
      <PipelineFlow stages={stages} />
      {stages.map((s, i) => {
        const pos = stagePosition(i, stages.length)
        const active = i === stageIndex
        return (
          <group key={s.key} position={pos}>
            {/* Small overview marker + wayfinding label — kept low and
                subdued so it never competes with the active stage's big
                in-scene name or its simulation above it. */}
            <mesh
              position={[0, -1.05, 0]}
              onClick={(e) => {
                e.stopPropagation()
                onSelect(i)
              }}
            >
              <octahedronGeometry args={[active ? 0.32 : 0.18, 0]} />
              <meshPhysicalMaterial
                color={s.color}
                emissive={s.color}
                emissiveIntensity={active ? 1.1 : 0.2}
                roughness={0.3}
                metalness={0.55}
                clearcoat={0.5}
                clearcoatRoughness={0.25}
                transparent
                opacity={active ? 0.95 : 0.4}
              />
            </mesh>
            <Text
              position={[0, -1.42, 0]}
              fontSize={0.15}
              color={active ? '#8fb4d9' : '#3d4b60'}
              anchorX="center"
              anchorY="top"
              maxWidth={2}
            >
              {s.short}
            </Text>
            {i < stages.length - 1 && (
              <ConnectorLine from={pos} to={stagePosition(i + 1, stages.length)} active={active} />
            )}
          </group>
        )
      })}
    </group>
  )
}

function ConnectorLine({ from, to, active }) {
  // Draw relative to this group's own origin (from), so subtract.
  const rel = [to[0] - from[0], to[1] - from[1], to[2] - from[2]]
  const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...rel)]
  return (
    <line>
      <bufferGeometry attach="geometry" onUpdate={(geo) => geo.setFromPoints(points)} />
      <lineBasicMaterial attach="material" color={active ? '#3d5a82' : '#1c2738'} transparent opacity={active ? 0.9 : 0.55} />
    </line>
  )
}

// A continuous stream of small particles travelling the full length of the
// pipeline path, independent of which stage is currently focused. This keeps
// the architecture reading as one connected, always-flowing system rather
// than nine disconnected islands.
const FLOW_COUNT = 46

function PipelineFlow({ stages }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const curve = useMemo(() => {
    const pts = stages.map((_, i) => new THREE.Vector3(...stagePosition(i, stages.length)))
    return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.2)
  }, [stages])

  const offsets = useMemo(
    () => Array.from({ length: FLOW_COUNT }, (_, i) => i / FLOW_COUNT),
    []
  )

  useFrame((state, delta) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime * 0.005
    offsets.forEach((o, i) => {
      const u = (o + t) % 1
      const p = curve.getPointAt(u)
      dummy.position.copy(p)
      dummy.position.y += 0.12
      dummy.scale.setScalar(0.045)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, FLOW_COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial color="#5eead4" emissive="#5eead4" emissiveIntensity={1.1} toneMapped={false} transparent opacity={0.85} />
    </instancedMesh>
  )
}
