import { useCallback, useEffect, useRef, useState } from 'react'
import { STAGES } from '../data/demoData.js'

const BASE_STAGE_MS = 5000 // 4-6s per stage, before speed multiplier
const COMPLETION_PAUSE_MS = 2200 // brief pause on the final (MITRE) stage before looping

export function usePipeline() {
  const [stageIndex, setStageIndex] = useState(0)
  // Auto-run cinematic experience by default: no button press required.
  const [playing, setPlaying] = useState(true)
  const [autoPlay, setAutoPlay] = useState(true)
  const [cameraMode, setCameraMode] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [dataMode, setDataMode] = useState('DEMO') // 'DEMO' | 'REAL'
  const [selectedNode, setSelectedNode] = useState(null)
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [cameraResetToken, setCameraResetToken] = useState(0)
  // Ticks up whenever the pipeline loops back to stage 0, so the scene can
  // do a clean "restart" moment without a page reload.
  const [loopToken, setLoopToken] = useState(0)
  // True while the user is actively dragging/orbiting the camera; used to
  // temporarily suspend the cinematic auto-camera without disabling it.
  const [userInteracting, setUserInteracting] = useState(false)

  const autoTimer = useRef(null)

  const goTo = useCallback((idx) => {
    const total = STAGES.length
    // Wrap around so manual Prev/Next feel continuous with the auto-loop.
    setStageIndex(((idx % total) + total) % total)
  }, [])

  const next = useCallback(() => goTo(stageIndex + 1), [stageIndex, goTo])
  const prev = useCallback(() => goTo(stageIndex - 1), [stageIndex, goTo])

  const reset = useCallback(() => {
    setStageIndex(0)
    setPlaying(true)
    setAutoPlay(true)
    setSelectedNode(null)
    setSelectedFeature(null)
    setCameraResetToken((t) => t + 1)
    setLoopToken((t) => t + 1)
  }, [])

  const resetCamera = useCallback(() => setCameraResetToken((t) => t + 1), [])

  // Drives automatic stage advancement. Uses a chained timeout (rather than
  // a fixed setInterval) so each stage can hold for its own duration and the
  // final stage can add a short "completion" pause before looping.
  useEffect(() => {
    if (!autoPlay || !playing) return undefined

    const isLast = stageIndex >= STAGES.length - 1
    const holdMs = (isLast ? BASE_STAGE_MS + COMPLETION_PAUSE_MS : BASE_STAGE_MS) / speed

    autoTimer.current = setTimeout(() => {
      if (isLast) {
        setStageIndex(0)
        setLoopToken((t) => t + 1)
      } else {
        setStageIndex((i) => Math.min(STAGES.length - 1, i + 1))
      }
    }, holdMs)

    return () => clearTimeout(autoTimer.current)
  }, [autoPlay, playing, speed, stageIndex])

  return {
    stage: STAGES[stageIndex],
    stageIndex,
    stages: STAGES,
    goTo,
    next,
    prev,
    playing,
    setPlaying,
    autoPlay,
    setAutoPlay,
    cameraMode,
    setCameraMode,
    speed,
    setSpeed,
    dataMode,
    setDataMode,
    reset,
    selectedNode,
    setSelectedNode,
    selectedFeature,
    setSelectedFeature,
    cameraResetToken,
    resetCamera,
    loopToken,
    userInteracting,
    setUserInteracting,
  }
}
