import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { DEMO_MITRE_STAGES, DEMO_MITRE_PREDICTED_STAGE } from '../data/demoData.js'

export default function MitreStage({ playing, speed }) {
  const pulseRef = useRef()
  const groupRefs = useRef([])
  const t = useRef(0)
  const stageT = useRef(0)
  const gap = 2.2
  const startX = -((DEMO_MITRE_STAGES.length - 1) * gap) / 2
  const predictedIndex = DEMO_MITRE_STAGES.indexOf(DEMO_MITRE_PREDICTED_STAGE)

  useFrame((_, delta) => {
    if (playing) {
      t.current += delta * speed
      stageT.current = Math.min(1.4, stageT.current + delta * speed)
    }
    if (pulseRef.current) {
      const phase = (Math.sin(t.current * 0.9) + 1) / 2
      pulseRef.current.scale.setScalar(1 + phase * 0.4)
    }
    // Attack-stage intelligence appears left-to-right as it's "produced".
    groupRefs.current.forEach((g, i) => {
      if (!g) return
      const appear = THREE.MathUtils.clamp(stageT.current * 1.3 - i * 0.18, 0, 1)
      g.scale.setScalar(THREE.MathUtils.smoothstep(appear, 0, 1))
    })
  })

  return (
    <group>
      <Text position={[0, 2.1, 0]} fontSize={0.2} color="#fca5a5" anchorX="center">
        Prediction → Attack Intelligence → MITRE ATT&CK
      </Text>

      {DEMO_MITRE_STAGES.map((name, i) => {
        const x = startX + i * gap
        const isPredicted = i === predictedIndex
        return (
          <group key={name} position={[x, 0, 0]} ref={(el) => (groupRefs.current[i] = el)}>
            {i < DEMO_MITRE_STAGES.length - 1 && (
              <ArrowLine from={[0.55, 0, 0]} to={[gap - 0.55, 0, 0]} />
            )}
            <mesh ref={isPredicted ? pulseRef : undefined}>
              <cylinderGeometry args={[0.4, 0.4, 0.25, 24]} />
              <meshPhysicalMaterial
                color={isPredicted ? '#f87171' : '#5b6b85'}
                emissive={isPredicted ? '#f87171' : '#5b6b85'}
                emissiveIntensity={isPredicted ? 1 : 0.25}
                roughness={0.3}
                metalness={0.5}
                clearcoat={0.4}
              />
            </mesh>
            <Text position={[0, -0.55, 0]} fontSize={0.13} color={isPredicted ? '#fca5a5' : '#8b97ac'} anchorX="center" maxWidth={2}>
              {name}
            </Text>
          </group>
        )
      })}

      <Text position={[0, -1.6, 0]} fontSize={0.16} color="#fff" anchorX="center">
        {`Predicted stage: ${DEMO_MITRE_PREDICTED_STAGE} (demo mapping)`}
      </Text>
    </group>
  )
}

function ArrowLine({ from, to }) {
  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)]
  return (
    <line>
      <bufferGeometry attach="geometry" onUpdate={(geo) => geo.setFromPoints(points)} />
      <lineBasicMaterial attach="material" color="#5b3a3a" />
    </line>
  )
}
