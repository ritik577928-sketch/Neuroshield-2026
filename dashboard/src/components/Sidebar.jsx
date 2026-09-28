import React from 'react'
import { ShieldCheck } from './Icons.jsx'
import { NAV_ITEMS } from '../data/navigation.js'

export default function Sidebar({ activeTab, onSelectTab }) {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-row">
          <div className="brand-icon">
            <ShieldCheck size={20} />
          </div>
          <div className="brand-text">
            <div className="brand-title">NeuroShield</div>
            <div className="brand-subtitle">AI Intrusion & Forecasting</div>
          </div>
        </div>

        <div className="sih-tag">
          <span className="status-dot-active"></span>
          <span>SIH 2026 • PS SIH26153</span>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="sidebar-nav" aria-label="Main Navigation">
        <div className="nav-section-label">Operations & Research</div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="nav-item-icon">
                <Icon size={17} />
              </div>
              <span className="nav-item-label">{item.label}</span>
              {item.badge && (
                <span className={`nav-badge ${item.badgeType}`}>
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
