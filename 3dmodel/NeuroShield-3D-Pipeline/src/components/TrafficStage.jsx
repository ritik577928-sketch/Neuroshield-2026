import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const COUNT = 260

export default function TrafficStage({ playing, speed }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {
    return Array.from({ length: COUNT }, (_, i) => ({
      lane: Math.floor(Math.random() * 6) - 3,
      z: Math.random() * 10,
      speed: 0.6 + Math.random() * 0.8,
      y: (Math.random() - 0.5) * 2.4,
      suspicious: Math.random() < 0.08,
    }))
  }, [])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const dt = playing ? delta * speed : 0
    particles.forEach((p, i) => {
      p.z -= p.speed * dt * 2
      if (p.z < -6) p.z = 10
      dummy.position.set(p.lane * 0.9, p.y, p.z)
      dummy.scale.setScalar(p.suspicious ? 0.09 : 0.055)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group position={[0, 0, 0]}>
      <instancedMesh ref={meshRef} args={[null, null, COUNT]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </instancedMesh>
      <Text position={[0, 1.9, 0]} fontSize={0.22} color="#9fd8f7" anchorX="center">
        Network Flow Records (Source IP → Destination IP)
      </Text>
      <Text position={[0, -1.9, 0]} fontSize={0.15} color="#6d7890" anchorX="center">
        Each particle = one flow record, not an individual packet
      </Text>
    </group>
  )
}
