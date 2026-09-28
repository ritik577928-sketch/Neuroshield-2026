import React from 'react'
import { NAV_ITEMS } from '../data/navigation.js'

export default function TopBar({ activeTab }) {
  const currentItem = NAV_ITEMS.find((item) => item.id === activeTab) || NAV_ITEMS[0]
  const Icon = currentItem.icon

  return (
    <header className="topbar-header">
      <div className="topbar-left">
        <div className="topbar-breadcrumb">
          <span className="breadcrumb-root">NeuroShield</span>
          <span className="breadcrumb-separator">/</span>
          <div className="topbar-title">
            <Icon size={16} className="topbar-icon" />
            <span>{currentItem.label}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
