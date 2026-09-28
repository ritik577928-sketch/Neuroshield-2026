import React, { useRef, useState } from 'react'
import { Compass, RefreshCw, Maximize2, ExternalLink } from './Icons.jsx'

export default function PipelineFlowView() {
  const iframeRef = useRef(null)
  const [iframeKey, setIframeKey] = useState(0)

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1)
  }

  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen()
      } else if (iframeRef.current.webkitRequestFullscreen) {
        iframeRef.current.webkitRequestFullscreen()
      }
    }
  }

  const handleOpenExternal = () => {
    window.open('/3dmodel/index.html', '_blank')
  }

  return (
    <div className="pipeline-flow-container">
      <div className="flow-toolbar">
        <div className="flow-title-info">
          <Compass size={16} style={{ color: 'var(--accent-primary)' }} />
          <span><strong>Interactive 3D WebGL Pipeline:</strong> Rotate, pan, zoom, and select stage nodes to inspect state dynamics</span>
        </div>

        <div className="flow-actions">
          <button className="flow-btn" onClick={handleRefresh} title="Reset camera & view">
            <RefreshCw size={13} />
            <span>Reset View</span>
          </button>

          <button className="flow-btn" onClick={handleFullscreen} title="View 3D Pipeline in Fullscreen">
            <Maximize2 size={13} />
            <span>Fullscreen</span>
          </button>

          <button className="flow-btn" onClick={handleOpenExternal} title="Open in dedicated tab">
            <ExternalLink size={13} />
            <span>Open Dedicated Tab</span>
          </button>
        </div>
      </div>

      <div className="flow-iframe-wrapper">
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src="/3dmodel/index.html"
          title="NeuroShield 3D Pipeline Explorer"
          className="flow-iframe"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}
