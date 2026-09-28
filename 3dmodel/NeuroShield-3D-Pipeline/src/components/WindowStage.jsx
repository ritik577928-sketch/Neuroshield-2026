import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { AGGREGATIONS, TEMPORAL_WINDOW_COUNT } from '../data/demoData.js'

export default function WindowStage({ playing, speed }) {
  const [active, setActive] = useState(null)
  const groupRef = useRef()
  const t = useRef(0)

  useFrame((_, delta) => {
    if (playing) t.current += delta * speed
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        if (child.userData.isWindow) {
          const phase = t.current * 0.8 - i * 0.3
          child.position.y = 0.05 * Math.sin(phase) + (child.userData.baseY ?? 0)
        }
      })
    }
  })

  const gap = 1.05
  const startX = -((TEMPORAL_WINDOW_COUNT - 1) * gap) / 2

  return (
    <group ref={groupRef}>
      <Text position={[0, 2.3, 0]} fontSize={0.22} color="#a5b4fc" anchorX="center">
        10 × 30-second windows = 5-minute history
      </Text>

      {AGGREGATIONS.map((a, i) => (
        <Text
          key={a}
          position={[startX - 2.2, 1.2 - i * 0.32, 0]}
          fontSize={0.16}
          color="#8b97ac"
          anchorX="left"
        >
          {a}
        </Text>
      ))}

      {Array.from({ length: TEMPORAL_WINDOW_COUNT }, (_, i) => {
        const x = startX + i * gap
        const isActive = active === i
        return (
          <group
            key={i}
            position={[x, 0, 0]}
            userData={{ isWindow: true, baseY: 0 }}
            onClick={(e) => {
              e.stopPropagation()
              setActive(i)
            }}
          >
            <mesh>
              <boxGeometry args={[0.75, 0.9, 0.75]} />
              <meshStandardMaterial
                color="#818cf8"
                emissive="#818cf8"
                emissiveIntensity={isActive ? 1 : 0.4}
                transparent
                opacity={0.85}
              />
            </mesh>
            <Text position={[0, -0.75, 0]} fontSize={0.15} color="#c7d0e6" anchorX="center">
              {`W${i + 1}`}
            </Text>
            <Text position={[0, -0.98, 0]} fontSize={0.1} color="#6d7890" anchorX="center">
              {`${i * 30}-${i * 30 + 30}s`}
            </Text>
          </group>
        )
      })}
    </group>
  )
}
