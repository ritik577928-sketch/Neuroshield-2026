import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { FUTURE_HORIZONS, DEMO_ATTACK_PROBABILITY } from '../data/demoData.js'

const PAST_COUNT = 10

export default function WorldModelStage({ playing, speed }) {
  const pulseRef = useRef()
  const t = useRef(0)
  const stageT = useRef(0)
  const futureGroupRefs = useRef([])
  const futureLineGeoRef = useRef()

  const pastPoints = useMemo(
    () =>
      Array.from({ length: PAST_COUNT }, (_, i) => {
        const x = -6 + i * 0.5
        const y = Math.sin(i * 0.6) * 0.5
        return new THREE.Vector3(x, y, 0)
      }),
    []
  )

  const futurePoints = useMemo(() => {
    let last = pastPoints[pastPoints.length - 1]
    return FUTURE_HORIZONS.map((sec, i) => {
      const x = last.x + 0.9 + i * 0.8
      const y = last.y + Math.sin(i * 0.9 + 1) * 0.6 + i * 0.05
      return { pos: new THREE.Vector3(x, y, 0), sec }
    })
  }, [pastPoints])

  useFrame((_, delta) => {
    if (playing) {
      t.current += delta * speed
      // The future trajectory takes ~2.5s (scaled by speed) to fully extend,
      // so the viewer sees it visibly growing forward from the present.
      stageT.current = Math.min(1, stageT.current + delta * speed * 0.4)
    }

    if (pulseRef.current) {
      const cycle = (t.current * 0.3) % (pastPoints.length + futurePoints.length)
      const all = [...pastPoints, ...futurePoints.map((f) => f.pos)]
      const idx = Math.floor(cycle)
      const next = all[(idx + 1) % all.length]
      const frac = cycle - idx
      pulseRef.current.position.lerpVectors(all[idx], next, frac)
    }

    futureGroupRefs.current.forEach((g, i) => {
      if (!g) return
      const appear = THREE.MathUtils.clamp(stageT.current * (futurePoints.length + 1) - i, 0, 1)
      g.scale.setScalar(THREE.MathUtils.smoothstep(appear, 0, 1))
    })

    if (futureLineGeoRef.current) {
      const totalVerts = futurePoints.length + 1
      const visibleVerts = Math.max(2, Math.round(stageT.current * totalVerts) + 1)
      futureLineGeoRef.current.setDrawRange(0, Math.min(totalVerts, visibleVerts))
    }
  })

  const pastLine = useMemo(() => pastPoints, [pastPoints])
  const futureLine = useMemo(
    () => [pastPoints[pastPoints.length - 1], ...futurePoints.map((f) => f.pos)],
    [pastPoints, futurePoints]
  )

  return (
    <group>
      <Text position={[-3, 2.3, 0]} fontSize={0.2} color="#fdba74" anchorX="center">
        Observed History
      </Text>
      <Text position={[5, 2.3, 0]} fontSize={0.2} color="#fca5a5" anchorX="center">
        Predicted Future
      </Text>

      <Line3D points={pastLine} color="#38bdf8" />
      <Line3D points={futureLine} color="#fb923c" dashed geoRef={futureLineGeoRef} />

      {pastPoints.map((p, i) => (
        <mesh key={`p${i}`} position={p}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.6} />
        </mesh>
      ))}

      {futurePoints.map((f, i) => (
        <group key={`f${i}`} position={f.pos} ref={(el) => (futureGroupRefs.current[i] = el)}>
          <mesh>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshPhysicalMaterial
              color="#fb923c"
              emissive="#fb923c"
              emissiveIntensity={0.9}
              roughness={0.3}
              metalness={0.4}
              clearcoat={0.5}
            />
          </mesh>
          <Text position={[0, 0.28, 0]} fontSize={0.12} color="#fdba74" anchorX="center">
            {`+${f.sec}s`}
          </Text>
        </group>
      ))}

      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>

      <group position={[0, -2.3, 0]}>
        <Text fontSize={0.18} color="#fff" anchorX="center">
          {`Attack Probability: ${DEMO_ATTACK_PROBABILITY.toFixed(2)} (illustrative)`}
        </Text>
        <mesh position={[0, -0.35, 0]}>
          <boxGeometry args={[4, 0.18, 0.05]} />
          <meshStandardMaterial color="#2a3444" />
        </mesh>
        <mesh position={[-2 + (4 * DEMO_ATTACK_PROBABILITY) / 2, -0.35, 0.03]}>
          <boxGeometry args={[4 * DEMO_ATTACK_PROBABILITY, 0.18, 0.05]} />
          <meshStandardMaterial color="#fb923c" emissive="#fb923c" emissiveIntensity={0.6} />
        </mesh>
      </group>
    </group>
  )
}

function Line3D({ points, color, dashed, geoRef }) {
  return (
    <line>
      <bufferGeometry
        ref={geoRef}
        attach="geometry"
        onUpdate={(geo) => geo.setFromPoints(points)}
      />
      <lineBasicMaterial attach="material" color={color} transparent opacity={dashed ? 0.75 : 0.9} />
    </line>
  )
}
