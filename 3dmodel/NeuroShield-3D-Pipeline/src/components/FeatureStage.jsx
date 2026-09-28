import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { FEATURE_GROUPS } from '../data/demoData.js'

const RAW_COUNT = 79

export default function FeatureStage({ playing, speed, onSelectFeature }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const progress = useRef(0)

  const rawCols = useMemo(
    () =>
      Array.from({ length: RAW_COUNT }, (_, i) => {
        const col = i % 20
        const row = Math.floor(i / 20)
        return { x: -6.5 + col * 0.4, y: row * 0.42 - 1.6 }
      }),
    []
  )

  // Precompute target positions for the 25 grouped feature nodes.
  const groupTargets = useMemo(() => {
    const targets = []
    let idx = 0
    const gapX = 1.15
    let startX = -((FEATURE_GROUPS.length - 1) * gapX) / 2
    FEATURE_GROUPS.forEach((g, gi) => {
      for (let j = 0; j < g.count; j++) {
        targets.push({
          x: startX + gi * gapX + (Math.random() - 0.5) * 0.15,
          y: j * 0.4 - (g.count * 0.4) / 2 + 1.6,
          color: g.color,
          group: g.name,
          index: j,
        })
        idx++
      }
    })
    return targets
  }, [])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    if (playing) progress.current = Math.min(1, progress.current + delta * 0.2 * speed)
    const p = progress.current

    for (let i = 0; i < RAW_COUNT; i++) {
      const raw = rawCols[i]
      const target = groupTargets[i % groupTargets.length]
      const x = THREE.MathUtils.lerp(raw.x, target.x + 6, p)
      const y = THREE.MathUtils.lerp(raw.y, target.y, p)
      dummy.position.set(x, y, THREE.MathUtils.lerp(0, 0.4, p))
      const scale = THREE.MathUtils.lerp(0.14, 0.2, p)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh ref={meshRef} args={[null, null, RAW_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.4} />
      </instancedMesh>

      <Text position={[-6.5, 2.2, 0]} fontSize={0.24} color="#9fd8f7" anchorX="center">
        79 Raw Features
      </Text>
      <Text position={[6, 3.0, 0]} fontSize={0.24} color="#c9a6fb" anchorX="center">
        25 Behavioral Features
      </Text>

      {groupTargets.map((t, i) => (
        <mesh
          key={i}
          position={[t.x + 6, t.y, 0.4]}
          onClick={(e) => {
            e.stopPropagation()
            onSelectFeature?.({
              feature: `${t.group} #${t.index + 1}`,
              influence: ['Low', 'Medium', 'High'][i % 3],
              topWindows: ['W' + ((i % 10) + 1), 'W' + (((i + 3) % 10) + 1)],
            })
          }}
        >
          <sphereGeometry args={[0.14, 12, 12]} />
          <meshStandardMaterial color={t.color} emissive={t.color} emissiveIntensity={0.7} />
        </mesh>
      ))}

      {FEATURE_GROUPS.map((g, gi) => {
        const gapX = 1.15
        const startX = -((FEATURE_GROUPS.length - 1) * gapX) / 2
        return (
          <Text
            key={g.name}
            position={[startX + gi * gapX + 6, -2.4, 0.4]}
            fontSize={0.13}
            color={g.color}
            anchorX="center"
            maxWidth={1.1}
            textAlign="center"
          >
            {g.name}
          </Text>
        )
      })}
    </group>
  )
}
