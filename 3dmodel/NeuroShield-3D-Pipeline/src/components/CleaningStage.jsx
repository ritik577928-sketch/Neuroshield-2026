import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const COUNT = 90

export default function CleaningStage({ playing, speed }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const items = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        startX: -5 + Math.random() * 2,
        endX: 3 + (i % 10) * 0.4 - 2,
        endY: Math.floor(i / 10) * 0.35 - 1.6,
        jitter: Math.random() * Math.PI * 2,
      })),
    []
  )
  const progress = useRef(0)

  useFrame((_, delta) => {
    if (!meshRef.current) return
    if (playing) progress.current = Math.min(1, progress.current + delta * 0.25 * speed)
    const p = progress.current
    items.forEach((it, i) => {
      const x = THREE.MathUtils.lerp(it.startX, it.endX, p)
      const y = THREE.MathUtils.lerp(Math.sin(it.jitter) * 1.6, it.endY, p)
      dummy.position.set(x, y, 0)
      dummy.scale.setScalar(0.09)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh ref={meshRef} args={[null, null, COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={0.5} />
      </instancedMesh>
      <Text position={[-5, 2.1, 0]} fontSize={0.2} color="#9fd8f7" anchorX="center">
        Raw / messy records
      </Text>
      <Text position={[2, 2.1, 0]} fontSize={0.2} color="#9fd8f7" anchorX="center">
        Cleaned & normalized
      </Text>
    </group>
  )
}
