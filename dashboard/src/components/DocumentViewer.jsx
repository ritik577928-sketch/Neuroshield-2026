import React, { useMemo } from 'react'
import { parseMarkdown } from '../utils/markdownParser.js'

export default function DocumentViewer({ 
  title, 
  subtitle, 
  date, 
  docId, 
  rawMarkdown 
}) {
  // Parse markdown and extract TOC
  const { html, toc } = useMemo(() => {
    return parseMarkdown(rawMarkdown)
  }, [rawMarkdown])

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="doc-viewer-wrapper">
      {toc.length > 0 && (
        <aside className="doc-toc-sidebar" aria-label="Table of Contents">
          <div className="doc-toc-title">Table of Contents</div>
          <div className="doc-toc-list">
            {toc.map((item, idx) => (
              <button
                key={idx}
                className="doc-toc-item"
                style={{ 
                  paddingLeft: item.level === 2 ? '18px' : '10px',
                  fontWeight: item.level === 1 ? '600' : '400',
                  color: item.level === 1 ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
                onClick={() => scrollToSection(item.id)}
                title={item.text}
              >
                {item.text}
              </button>
            ))}
          </div>
        </aside>
      )}

      <main className="doc-main-scroll">
        <div className="doc-content-container">
          <div className="doc-meta-banner">
            <div className="doc-meta-col">
              <span>DOCUMENT CLASSIFICATION</span>
              <span>{title}</span>
            </div>
            <div className="doc-meta-col">
              <span>AUDIT REFERENCE</span>
              <span>{docId}</span>
            </div>
            <div className="doc-meta-col">
              <span>AUDIT DATE</span>
              <span>{date}</span>
            </div>
            <div className="doc-meta-col">
              <span>VERIFICATION</span>
              <span style={{ color: 'var(--status-success)' }}>EVIDENCE-BASED AUDIT</span>
            </div>
          </div>

          <article 
            className="markdown-body" 
            dangerouslySetInnerHTML={{ __html: html }} 
          />
        </div>
      </main>
    </div>
  )
}
