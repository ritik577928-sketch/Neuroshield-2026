import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import VideoView from './components/VideoView.jsx'
import PrototypeVideoView from './components/PrototypeVideoView.jsx'
import PipelineFlowView from './components/PipelineFlowView.jsx'
import DocumentViewer from './components/DocumentViewer.jsx'
import ResearchReferencesView from './components/ResearchReferencesView.jsx'
import { feasibilityMarkdown } from './data/feasibilityContent.js'
import { viabilityMarkdown } from './data/viabilityContent.js'

const VALID_TABS = [
  'video-3d',
  'video-prototype',
  'model-flow',
  'feasibility',
  'viability',
  'research'
]

export default function App() {
  // Sync state with URL hash for browser history / back / forward support
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '')
    if (VALID_TABS.includes(hash)) {
      return hash
    }
    return 'video-3d'
  }

  const [activeTab, setActiveTab] = useState(getInitialTab)

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId)
    window.location.hash = tabId
  }

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (VALID_TABS.includes(hash)) {
        setActiveTab(hash)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} onSelectTab={handleSelectTab} />

      <div className="main-area">
        <TopBar activeTab={activeTab} />

        <div className="content-body">
          {activeTab === 'video-3d' && <VideoView />}
          {activeTab === 'video-prototype' && <PrototypeVideoView />}
          {activeTab === 'model-flow' && <PipelineFlowView />}
          {activeTab === 'feasibility' && (
            <DocumentViewer
              title="Technical Feasibility Evaluation Matrix & Assessment Framework"
              subtitle="5 Pillars Feasibility Framework (Technical, Operational, Economic, Schedule, Legal)"
              date="September 27, 2026"
              docId="SIH26153-FEASIBILITY-AUDIT-V3"
              rawMarkdown={feasibilityMarkdown}
            />
          )}
          {activeTab === 'viability' && (
            <DocumentViewer
              title="Investor Viability, Frugal Cost Analysis & ROI Blueprint"
              subtitle="Phase-by-Phase Feasibility & Commercial Productization"
              date="September 27, 2026"
              docId="SIH26153-INVESTOR-VIABILITY-V3"
              rawMarkdown={viabilityMarkdown}
            />
          )}
          {activeTab === 'research' && <ResearchReferencesView />}
        </div>
      </div>
    </div>
  )
}
