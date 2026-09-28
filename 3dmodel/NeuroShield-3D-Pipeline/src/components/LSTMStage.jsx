import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { TEMPORAL_WINDOW_COUNT } from '../data/demoData.js'

export default function LSTMStage({ playing, speed }) {
  const flowRef = useRef()
  const t = useRef(0)
  const gap = 1.3
  const startX = -((TEMPORAL_WINDOW_COUNT - 1) * gap) / 2

  useFrame((_, delta) => {
    if (playing) t.current += delta * speed
    if (flowRef.current) {
      const phase = (t.current * 0.5) % 1
      flowRef.current.position.x = THREE.MathUtils.lerp(startX, startX + gap * (TEMPORAL_WINDOW_COUNT - 1), phase)
    }
  })

  return (
    <group>
      <Text position={[0, 2.0, 0]} fontSize={0.22} color="#f9a8d4" anchorX="center">
        Past network behavior → learned temporal state
      </Text>

      {Array.from({ length: TEMPORAL_WINDOW_COUNT }, (_, i) => {
        const x = startX + i * gap
        return (
          <group key={i} position={[x, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.85, 0.65, 0.5]} />
              <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.45} />
            </mesh>
            <Text position={[0, -0.6, 0]} fontSize={0.13} color="#c7d0e6" anchorX="center">
              {i === TEMPORAL_WINDOW_COUNT - 1 ? 'LSTM (now)' : 'LSTM'}
            </Text>
            {i < TEMPORAL_WINDOW_COUNT - 1 && (
              <ArrowLine from={[0.43, 0, 0]} to={[gap - 0.43, 0, 0]} />
            )}
          </group>
        )
      })}

      <mesh ref={flowRef} position={[startX, 0, 0]}>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshStandardMaterial color="#ffffff" emissive="#f472b6" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>

      <Text position={[startX - 0.9, 0, 0]} fontSize={0.14} color="#8b97ac" anchorX="center">
        W1
      </Text>
      <Text position={[startX + gap * (TEMPORAL_WINDOW_COUNT - 1) + 1.1, 0, 0]} fontSize={0.16} color="#fff" anchorX="center">
        Temporal State
      </Text>
    </group>
  )
}

function ArrowLine({ from, to }) {
  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)]
  return (
    <line>
      <bufferGeometry attach="geometry" onUpdate={(geo) => geo.setFromPoints(points)} />
      <lineBasicMaterial attach="material" color="#7a4a63" />
    </line>
  )
}
