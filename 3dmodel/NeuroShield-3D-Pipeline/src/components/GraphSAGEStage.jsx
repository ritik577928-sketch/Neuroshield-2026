import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

// A small illustrative mini-graph: a center node aggregating from neighbors,
// then collapsing into an embedding point cloud on the right.
const MINI_NODES = [
  { id: 'A', x: -6, y: 0.8 },
  { id: 'B', x: -6.8, y: -0.4 },
  { id: 'C', x: -5.2, y: -0.4 },
  { id: 'D', x: -7.4, y: -1.4 },
  { id: 'E', x: -6.2, y: -1.6 },
  { id: 'F', x: -4.8, y: -1.4 },
]
const MINI_EDGES = [
  ['A', 'B'],
  ['A', 'C'],
  ['B', 'D'],
  ['B', 'E'],
  ['C', 'F'],
]

const EMBED_COUNT = 60

export default function GraphSAGEStage({ playing, speed }) {
  const nodeMap = useMemo(() => Object.fromEntries(MINI_NODES.map((n) => [n.id, n])), [])
  const flowRefs = useRef([])
  const t = useRef(0)

  const embedPositions = useMemo(
    () =>
      Array.from({ length: EMBED_COUNT }, () => {
        const r = 0.9 * Math.cbrt(Math.random())
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        return new THREE.Vector3(
          6 + r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        )
      }),
    []
  )

  useFrame((_, delta) => {
    if (playing) t.current += delta * speed
    flowRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const [from, to] = MINI_EDGES[i]
      const a = nodeMap[from]
      const b = nodeMap[to]
      const phase = (t.current * 0.7 + i * 0.2) % 1
      mesh.position.set(
        THREE.MathUtils.lerp(b.x, a.x, phase),
        THREE.MathUtils.lerp(b.y, a.y, phase),
        0
      )
    })
  })

  return (
    <group>
      <Text position={[-6, 2.0, 0]} fontSize={0.2} color="#c9a6fb" anchorX="center">
        Neighborhood Aggregation
      </Text>
      <Text position={[6, 2.0, 0]} fontSize={0.2} color="#c9a6fb" anchorX="center">
        Graph Representation
      </Text>

      {MINI_EDGES.map(([from, to], i) => {
        const a = nodeMap[from]
        const b = nodeMap[to]
        const points = [new THREE.Vector3(a.x, a.y, 0), new THREE.Vector3(b.x, b.y, 0)]
        return (
          <line key={i}>
            <bufferGeometry attach="geometry" onUpdate={(geo) => geo.setFromPoints(points)} />
            <lineBasicMaterial attach="material" color="#6d4fa8" transparent opacity={0.6} />
          </line>
        )
      })}

      {MINI_EDGES.map((_, i) => (
        <mesh key={`p-${i}`} ref={(el) => (flowRefs.current[i] = el)}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={1.3} toneMapped={false} />
        </mesh>
      ))}

      {MINI_NODES.map((n) => (
        <mesh key={n.id} position={[n.x, n.y, 0]}>
          <sphereGeometry args={[n.id === 'A' ? 0.24 : 0.16, 16, 16]} />
          <meshStandardMaterial
            color="#a78bfa"
            emissive="#a78bfa"
            emissiveIntensity={n.id === 'A' ? 1 : 0.5}
          />
        </mesh>
      ))}

      {/* Arrow / flow connecting mini-graph to embedding cloud */}
      <Text position={[0, 0, 0]} fontSize={0.3} color="#8b97ac" anchorX="center">
        →
      </Text>

      {embedPositions.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.045, 6, 6]} />
          <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.7} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}
