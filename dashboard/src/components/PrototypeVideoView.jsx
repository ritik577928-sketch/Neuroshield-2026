import React from 'react'
import ComingSoon from './ComingSoon.jsx'
import { PlayCircle } from './Icons.jsx'

export default function PrototypeVideoView() {
  return (
    <ComingSoon
      badge="Section Status: Pending Material Ingestion"
      icon={PlayCircle}
      title="Prototype Demonstration Video"
      description="This section is being prepared with official NeuroShield project material. The live intrusion interception prototype recording will be integrated here upon submission."
      details={[
        'Problem Statement: Smart India Hackathon 2026 (SIH26153)',
        'Pipeline State: Functional Benchmark Prototype Verified',
        'Status: Awaiting official prototype screen recording upload',
      ]}
    />
  )
}
