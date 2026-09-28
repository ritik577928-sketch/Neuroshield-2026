import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { generateDemoGraph } from '../data/demoData.js'

export default function GraphStage({ playing, speed, onSelectNode }) {
  const { nodes, edges } = useMemo(() => generateDemoGraph(), [])
  const pulseRefs = useRef([])
  const nodeRefs = useRef([])
  const edgeMatRefs = useRef([])
  const t = useRef(0)
  const stageT = useRef(0)

  useFrame((_, delta) => {
    if (playing) {
      t.current += delta * speed
      stageT.current = Math.min(1.4, stageT.current + delta * speed)
    }

    // Nodes and edges "come online" in a staggered wave when the graph
    // stage becomes active, rather than all appearing instantly.
    nodeRefs.current.forEach((g, i) => {
      if (!g) return
      const appear = THREE.MathUtils.clamp(stageT.current * 1.6 - i * 0.05, 0, 1)
      const s = THREE.MathUtils.smoothstep(appear, 0, 1)
      g.scale.setScalar(s)
    })
    edgeMatRefs.current.forEach((mat, i) => {
      if (!mat) return
      const appear = THREE.MathUtils.clamp(stageT.current * 1.4 - i * 0.03, 0, 1)
      // Edges gently strengthen/weaken over time to feel "alive".
      const flicker = 0.75 + 0.25 * Math.sin(t.current * 1.3 + i * 0.7)
      mat.opacity = appear * (edges[i]?.suspicious ? 0.85 : 0.42) * flicker
    })

    pulseRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const edge = edges[i]
      const a = nodes[edge.source]
      const b = nodes[edge.target]
      const phase = (t.current * 0.6 + i * 0.13) % 1
      mesh.position.set(
        THREE.MathUtils.lerp(a.x, b.x, phase),
        THREE.MathUtils.lerp(a.y, b.y, phase),
        THREE.MathUtils.lerp(a.z, b.z, phase)
      )
      mesh.visible = stageT.current * 1.4 - i * 0.03 > 0.3
    })
  })

  return (
    <group>
      <Text position={[0, 3.6, 0]} fontSize={0.22} color="#c9a6fb" anchorX="center">
        Dynamic Communication Graph (demo — ~20 nodes)
      </Text>

      {edges.map((e, i) => {
        const a = nodes[e.source]
        const b = nodes[e.target]
        return (
          <Edge
            key={i}
            a={a}
            b={b}
            suspicious={e.suspicious}
            matRef={(el) => (edgeMatRefs.current[i] = el)}
          />
        )
      })}

      {edges.map((e, i) => (
        <mesh key={`pulse-${i}`} ref={(el) => (pulseRefs.current[i] = el)}>
          <sphereGeometry args={[0.045, 6, 6]} />
          <meshStandardMaterial
            color={e.suspicious ? '#f87171' : '#38bdf8'}
            emissive={e.suspicious ? '#f87171' : '#38bdf8'}
            emissiveIntensity={1.4}
            toneMapped={false}
          />
        </mesh>
      ))}

      {nodes.map((n, i) => (
        <group key={n.id} position={[n.x, n.y, n.z]} ref={(el) => (nodeRefs.current[i] = el)}>
          <mesh
            onClick={(e) => {
              e.stopPropagation()
              const connections = countConnections(edges, n.id)
              onSelectNode?.({
                label: n.label,
                connections,
                outgoing: (40 + n.id * 7) % 400,
                incoming: (25 + n.id * 11) % 350,
                suspicious: n.suspicious,
              })
            }}
          >
            <sphereGeometry args={[n.suspicious ? 0.22 : 0.16, 20, 20]} />
            <meshPhysicalMaterial
              color={n.suspicious ? '#fb923c' : '#a78bfa'}
              emissive={n.suspicious ? '#fb923c' : '#a78bfa'}
              emissiveIntensity={n.suspicious ? 0.9 : 0.5}
              roughness={0.25}
              metalness={0.6}
              clearcoat={0.6}
              clearcoatRoughness={0.2}
            />
          </mesh>
          <Text position={[0, 0.32, 0]} fontSize={0.11} color="#c7d0e6" anchorX="center">
            {n.label}
          </Text>
        </group>
      ))}
    </group>
  )
}

function countConnections(edges, id) {
  return edges.filter((e) => e.source === id || e.target === id).length
}

function Edge({ a, b, suspicious, matRef }) {
  const points = useMemo(
    () => [new THREE.Vector3(a.x, a.y, a.z), new THREE.Vector3(b.x, b.y, b.z)],
    [a, b]
  )
  return (
    <line>
      <bufferGeometry attach="geometry" onUpdate={(geo) => geo.setFromPoints(points)} />
      <lineBasicMaterial
        ref={matRef}
        attach="material"
        color={suspicious ? '#f87171' : '#3d4f6e'}
        transparent
        opacity={0}
      />
    </line>
  )
}
