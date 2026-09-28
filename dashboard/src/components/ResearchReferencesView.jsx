import React, { useState, useEffect, useRef, useCallback } from 'react'
import { RESEARCH_DOCUMENTS } from '../data/researchDocs.js'
import { 
  FileText, 
  ExternalLink, 
  Maximize2, 
  CheckCircle, 
  BookOpen, 
  RefreshCw 
} from './Icons.jsx'

export default function ResearchReferencesView() {
  const [activeDocId, setActiveDocId] = useState(RESEARCH_DOCUMENTS[0].id)
  const [loadedDocs, setLoadedDocs] = useState(() => {
    // Preload the first document immediately
    return { [RESEARCH_DOCUMENTS[0].id]: true }
  })
  
  const scrollContainerRef = useRef(null)
  const isClickScrollingRef = useRef(false)

  // Smooth scroll to target section when a navigation item is clicked
  const handleNavClick = (docId) => {
    isClickScrollingRef.current = true
    setActiveDocId(docId)

    // Mark as loaded so iframe renders immediately
    setLoadedDocs((prev) => ({ ...prev, [docId]: true }))

    const sectionEl = document.getElementById(docId)
    if (sectionEl) {
      sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Release programmatic scroll flag after animation
      setTimeout(() => {
        isClickScrollingRef.current = false
      }, 700)
    }
  }

  // Active section indicator on scroll using IntersectionObserver
  useEffect(() => {
    const observerOptions = {
      root: scrollContainerRef.current,
      rootMargin: '-10% 0px -60% 0px',
      threshold: 0.05,
    }

    const observer = new IntersectionObserver((entries) => {
      if (isClickScrollingRef.current) return

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveDocId(entry.target.id)
        }
      })
    }, observerOptions)

    RESEARCH_DOCUMENTS.forEach((doc) => {
      const el = document.getElementById(doc.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  // Lazy load PDF iframes as they approach viewport
  useEffect(() => {
    const lazyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.dataset.docId
            if (id) {
              setLoadedDocs((prev) => ({ ...prev, [id]: true }))
            }
          }
        })
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '400px 0px 400px 0px',
        threshold: 0.01,
      }
    )

    RESEARCH_DOCUMENTS.forEach((doc) => {
      const el = document.getElementById(doc.id)
      if (el) lazyObserver.observe(el)
    })

    return () => lazyObserver.disconnect()
  }, [])

  return (
    <div className="research-layout-wrapper">
      {/* ============================================================== */}
      {/* FIXED / STICKY LEFT-SIDE NAVIGATION PANEL                      */}
      {/* ============================================================== */}
      <aside className="research-nav-panel" aria-label="Research Documents Navigation">
        <div className="research-nav-header">
          <div className="research-nav-title">
            <BookOpen size={16} className="research-header-icon" />
            <span>Research Library</span>
          </div>
          <div className="research-nav-counter">
            <span>9 Authoritative Papers</span>
          </div>
        </div>

        <nav className="research-nav-list">
          {RESEARCH_DOCUMENTS.map((doc) => {
            const isActive = activeDocId === doc.id

            return (
              <button
                key={doc.id}
                onClick={() => handleNavClick(doc.id)}
                className={`research-nav-item ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'true' : undefined}
                title={`${doc.num}. ${doc.label} (${doc.fileName})`}
              >
                <span className="nav-item-num">{doc.num}</span>
                <span className="nav-item-text">{doc.label}</span>
                {isActive && <span className="nav-item-bullet" />}
              </button>
            )
          })}
        </nav>

        <div className="research-nav-footer">
          <div className="research-status-pill">
            <CheckCircle size={13} style={{ color: 'var(--status-success)' }} />
            <span>Original Repository PDFs</span>
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* CONTINUOUS MAIN SCROLL AREA WITH ALL 9 VERTICAL PDF SECTIONS  */}
      {/* ============================================================== */}
      <main className="research-main-scroll" ref={scrollContainerRef}>
        <div className="research-content-container">
          
          {/* Page Top Overview Banner */}
          <header className="research-library-hero">
            <div className="hero-pill-badge">
              <span>ACADEMIC FOUNDATIONS & REGULATORY FRAMEWORKS</span>
            </div>
            <h1 className="hero-heading">Research Foundations & Authoritative Security Sources</h1>
            <p className="hero-description">
              Research papers from established researchers and verified reports from recognized cybersecurity institutions that informed the design and development of NeuroShield.
            </p>
          </header>

          {/* Vertical Stack of All 9 PDF Sections */}
          <div className="research-documents-stack">
            {RESEARCH_DOCUMENTS.map((doc) => {
              const isLoaded = loadedDocs[doc.id]

              return (
                <section
                  key={doc.id}
                  id={doc.id}
                  data-doc-id={doc.id}
                  className="research-pdf-section"
                  aria-label={`${doc.label} Document`}
                >
                  {/* PDF Section Header Card */}
                  <div className="pdf-section-header">
                    <div className="pdf-header-main">
                      <div className="pdf-num-tag">{doc.num}</div>
                      <div className="pdf-title-block">
                        <div className="pdf-meta-top">
                          <span className="pdf-category-badge">{doc.category}</span>
                          <span className="pdf-filename-badge">
                            <FileText size={12} />
                            <span>{doc.fileName}</span>
                          </span>
                        </div>
                        <h2 className="pdf-heading">{doc.label}</h2>
                        <div className="pdf-topic-text">{doc.topic}</div>
                      </div>
                    </div>

                    <div className="pdf-header-actions">
                      <a
                        href={doc.src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pdf-action-btn"
                        title="Open this PDF in a separate browser tab"
                      >
                        <ExternalLink size={13} />
                        <span>Open In Tab</span>
                      </a>
                    </div>
                  </div>

                  {/* PDF Document Viewer Container */}
                  <div className="pdf-viewer-frame">
                    {isLoaded ? (
                      <iframe
                        src={`${doc.src}#toolbar=1&navpanes=0`}
                        title={`${doc.label} PDF - ${doc.fileName}`}
                        className="pdf-iframe-element"
                        loading="lazy"
                      />
                    ) : (
                      <div className="pdf-loading-placeholder">
                        <div className="pdf-loading-spinner" />
                        <div className="pdf-loading-text">
                          <span>Preparing {doc.fileName}...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section Separation Footer */}
                  <div className="pdf-section-footer">
                    <div className="pdf-footer-desc">
                      <strong>Context:</strong> {doc.description}
                    </div>
                    <div className="pdf-footer-origin">
                      <span>Source: Pdffile/{doc.fileName}</span>
                    </div>
                  </div>
                </section>
              )
            })}
          </div>

        </div>
      </main>
    </div>
  )
}
